#!/usr/bin/env python3
"""
AgriMandi Data Science & Analytics Pipeline
Ingests real data from live APMC/Agmarknet API endpoints.
Performs data manipulation & cleaning using Pandas.
Performs predictive modeling & clustering using Scikit-learn.
Generates publication-quality visualizations using Matplotlib and Seaborn.
Outputs strict JSON with statistical metrics and Base64-encoded visual plots.
"""

import sys
import json
import base64
import io
import os
import argparse
from typing import Dict, Any, List

def run_pipeline(records: List[Dict[str, Any]], commodity_filter: str = "All") -> Dict[str, Any]:
    # Lazy imports to ensure fast module load & clean error handling
    try:
        import pandas as pd
        import numpy as np
        import matplotlib
        matplotlib.use('Agg')  # Headless rendering for server environments
        import matplotlib.pyplot as plt
        import seaborn as sns
        from sklearn.linear_model import LinearRegression
        from sklearn.cluster import KMeans
        from sklearn.preprocessing import StandardScaler
        from sklearn.metrics import r2_score, mean_squared_error
    except ImportError as e:
        return {
            "status": "error",
            "message": f"Required Python library missing: {str(e)}. Please ensure pandas, scikit-learn, matplotlib, and seaborn are installed.",
            "metrics": {},
            "charts": {}
        }

    # 1. Ingest raw API records into Pandas DataFrame
    if not records or len(records) == 0:
        return {
            "status": "error",
            "message": "No valid records provided from API endpoint.",
            "metrics": {},
            "charts": {}
        }

    raw_df = pd.DataFrame(records)

    # 2. Strict Data Hygiene & Sanitization (Reject junk / corrupt data)
    # Map standard keys
    column_mapping = {
        'market': 'market',
        'Market': 'market',
        'district': 'district',
        'District': 'district',
        'commodity': 'commodity',
        'Commodity': 'commodity',
        'min_price': 'min_price',
        'Min_Price': 'min_price',
        'max_price': 'max_price',
        'Max_Price': 'max_price',
        'modal_price': 'modal_price',
        'Modal_Price': 'modal_price',
        'arrivals_tonnes': 'arrivals_tonnes',
        'Arrivals': 'arrivals_tonnes',
        'arrivals': 'arrivals_tonnes',
        'arrival_date': 'arrival_date',
        'Arrival_Date': 'arrival_date'
    }

    df = raw_df.rename(columns={k: v for k, v in column_mapping.items() if k in raw_df.columns})

    # Ensure essential columns exist
    for col in ['market', 'district', 'commodity']:
        if col not in df.columns:
            df[col] = 'Unknown'

    # Convert prices and volume to numeric, dropping corrupted non-numeric rows
    for num_col in ['min_price', 'max_price', 'modal_price', 'arrivals_tonnes']:
        if num_col in df.columns:
            df[num_col] = pd.to_numeric(df[num_col], errors='coerce')
        else:
            df[num_col] = np.nan

    # Drop rows where modal_price is null or <= 0 (Pure clean data only)
    df = df.dropna(subset=['modal_price'])
    df = df[df['modal_price'] > 0]

    # Impute missing min/max prices logically from modal price if needed
    df['min_price'] = df['min_price'].fillna(df['modal_price'] * 0.90)
    df['max_price'] = df['max_price'].fillna(df['modal_price'] * 1.10)
    df['arrivals_tonnes'] = df['arrivals_tonnes'].fillna(df['arrivals_tonnes'].median() if not df['arrivals_tonnes'].isna().all() else 100.0)

    # Filter by commodity if specified and present
    if commodity_filter and commodity_filter.lower() != "all":
        filtered_df = df[df['commodity'].str.lower() == commodity_filter.lower()]
        if len(filtered_df) >= 3:
            df = filtered_df

    n_samples = len(df)
    if n_samples < 2:
        return {
            "status": "error",
            "message": f"Insufficient valid records from API ({n_samples} record). Minimum 2 required for statistical modeling.",
            "metrics": {},
            "charts": {}
        }

    # 3. Pandas Feature Engineering
    df['price_spread'] = df['max_price'] - df['min_price']
    df['spread_pct'] = (df['price_spread'] / df['modal_price']) * 100
    df['modal_to_max_ratio'] = df['modal_price'] / df['max_price']

    # Summary Statistics via Pandas
    desc = df[['modal_price', 'min_price', 'max_price', 'price_spread', 'arrivals_tonnes']].describe().to_dict()

    summary_stats = {
        "count": int(df['modal_price'].count()),
        "mean_modal_price": round(float(df['modal_price'].mean()), 2),
        "median_modal_price": round(float(df['modal_price'].median()), 2),
        "std_modal_price": round(float(df['modal_price'].std()), 2) if n_samples > 1 else 0.0,
        "min_modal_price": round(float(df['modal_price'].min()), 2),
        "max_modal_price": round(float(df['modal_price'].max()), 2),
        "q25_modal_price": round(float(df['modal_price'].quantile(0.25)), 2),
        "q75_modal_price": round(float(df['modal_price'].quantile(0.75)), 2),
        "iqr_modal_price": round(float(df['modal_price'].quantile(0.75) - df['modal_price'].quantile(0.25)), 2),
        "total_arrivals_tonnes": round(float(df['arrivals_tonnes'].sum()), 1),
        "mean_arrivals_tonnes": round(float(df['arrivals_tonnes'].mean()), 1),
        "mean_price_spread": round(float(df['price_spread'].mean()), 2)
    }

    # District Level Aggregations via Pandas groupby
    district_group = df.groupby('district').agg(
        market_count=('market', 'count'),
        avg_modal_price=('modal_price', 'mean'),
        total_arrivals=('arrivals_tonnes', 'sum')
    ).reset_index()

    top_districts = []
    for _, row in district_group.sort_values(by='avg_modal_price', ascending=False).iterrows():
        top_districts.append({
            "district": str(row['district']),
            "market_count": int(row['market_count']),
            "avg_modal_price": round(float(row['avg_modal_price']), 2),
            "total_arrivals": round(float(row['total_arrivals']), 1)
        })

    # 4. Scikit-learn Machine Learning Models
    # Model A: Linear Regression (Predicting Modal Price from Volume and Price Band)
    X = df[['min_price', 'max_price', 'arrivals_tonnes']].values
    y = df['modal_price'].values

    reg_model = LinearRegression()
    reg_model.fit(X, y)
    y_pred = reg_model.predict(X)

    r2 = float(r2_score(y, y_pred)) if n_samples > 2 else 1.0
    mse = float(mean_squared_error(y, y_pred))
    rmse = round(float(np.sqrt(mse)), 2)

    regression_diagnostics = {
        "r2_score": round(max(0.0, min(1.0, r2)), 4),
        "rmse": rmse,
        "intercept": round(float(reg_model.intercept_), 2),
        "coeff_min_price": round(float(reg_model.coef_[0]), 4),
        "coeff_max_price": round(float(reg_model.coef_[1]), 4),
        "coeff_arrivals_tonnes": round(float(reg_model.coef_[2]), 4),
        "arrival_elasticity_pct": round(float(reg_model.coef_[2] * (df['arrivals_tonnes'].mean() / df['modal_price'].mean()) * 100), 2)
    }

    # Model B: Scikit-learn KMeans Clustering (Market Liquidity & Price Discovery Tiers)
    k_clusters = min(3, max(2, n_samples // 2))
    cluster_features = df[['modal_price', 'price_spread', 'arrivals_tonnes']].fillna(0)
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(cluster_features)

    kmeans = KMeans(n_clusters=k_clusters, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(scaled_features)

    cluster_summaries = []
    for c_id in range(k_clusters):
        c_df = df[df['cluster'] == c_id]
        if len(c_df) > 0:
            avg_p = float(c_df['modal_price'].mean())
            avg_v = float(c_df['arrivals_tonnes'].mean())
            avg_s = float(c_df['price_spread'].mean())
            
            # Formulate intuitive economic label
            if avg_v >= df['arrivals_tonnes'].median() and avg_p >= df['modal_price'].median():
                label = "Tier 1: High Liquidity & Premium Realization"
            elif avg_p >= df['modal_price'].median():
                label = "Tier 2: Quality Driven High-Price Market"
            else:
                label = "Tier 3: Bulk Wholesale Standard Rate Hub"

            cluster_summaries.append({
                "cluster_id": c_id,
                "label": label,
                "market_count": int(len(c_df)),
                "markets": c_df['market'].tolist()[:5],
                "avg_modal_price": round(avg_p, 2),
                "avg_arrivals": round(avg_v, 1),
                "avg_spread": round(avg_s, 2)
            })

    # 5. Matplotlib & Seaborn Visualizations
    sns.set_theme(style="whitegrid", font="sans-serif")
    charts = {}

    def fig_to_base64(fig) -> str:
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=85, bbox_inches='tight', facecolor='#ffffff')
        plt.close(fig)
        buf.seek(0)
        return "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')

    # Chart 1: Seaborn Distribution & KDE Density Plot of Modal Prices
    fig1, ax1 = plt.subplots(figsize=(8, 4.5))
    sns.histplot(
        data=df,
        x='modal_price',
        kde=True,
        ax=ax1,
        color='#059669',
        bins=min(15, max(5, n_samples)),
        edgecolor='#064e3b',
        alpha=0.65
    )
    ax1.axvline(df['modal_price'].mean(), color='#dc2626', linestyle='--', linewidth=1.8, label=f"Mean: ₹{df['modal_price'].mean():.1f}")
    ax1.axvline(df['modal_price'].median(), color='#2563eb', linestyle='-', linewidth=1.8, label=f"Median: ₹{df['modal_price'].median():.1f}")
    ax1.set_title(f"Mandi Price Distribution & Kernel Density (Seaborn) — {commodity_filter}", fontsize=13, fontweight='bold', pad=12)
    ax1.set_xlabel("Modal Price (₹ per Quintal)", fontsize=11, labelpad=8)
    ax1.set_ylabel("Reporting Mandi Count", fontsize=11, labelpad=8)
    ax1.legend(loc='upper right', frameon=True)
    charts['price_distribution'] = fig_to_base64(fig1)

    # Chart 2: Seaborn Regplot (Arrivals vs Modal Price with Scikit-learn Confidence Interval)
    fig2, ax2 = plt.subplots(figsize=(8, 4.5))
    sns.regplot(
        data=df,
        x='arrivals_tonnes',
        y='modal_price',
        ax=ax2,
        color='#0284c7',
        scatter_kws={'s': 55, 'alpha': 0.75, 'edgecolors': '#0369a1'},
        line_kws={'color': '#e11d48', 'linewidth': 2, 'label': f'Regression Trendline (R²={regression_diagnostics["r2_score"]})'}
    )
    ax2.set_title("Arrivals vs Price Elasticity (Seaborn & Scikit-learn)", fontsize=13, fontweight='bold', pad=12)
    ax2.set_xlabel("Daily Arrivals (Tonnes)", fontsize=11, labelpad=8)
    ax2.set_ylabel("Modal Price (₹/Quintal)", fontsize=11, labelpad=8)
    ax2.legend(loc='best', frameon=True)
    charts['volume_vs_price'] = fig_to_base64(fig2)

    # Chart 3: Matplotlib Top Mandis Bar Chart with Price Spread Error Bars
    fig3, ax3 = plt.subplots(figsize=(8, 5))
    top_df = df.sort_values(by='modal_price', ascending=True).tail(10)
    y_pos = np.arange(len(top_df))
    bars = ax3.barh(y_pos, top_df['modal_price'], color='#10b981', alpha=0.85, edgecolor='#047857', height=0.6)
    
    # Error bars for Min to Max spread
    xerr_lower = top_df['modal_price'] - top_df['min_price']
    xerr_upper = top_df['max_price'] - top_df['modal_price']
    ax3.errorbar(
        top_df['modal_price'],
        y_pos,
        xerr=[xerr_lower, xerr_upper],
        fmt='none',
        ecolor='#334155',
        elinewidth=1.5,
        capsize=3,
        label='Min-Max Spread Band'
    )
    ax3.set_yticks(y_pos)
    ax3.set_yticklabels(top_df['market'], fontsize=10)
    ax3.set_xlabel("Modal Price (₹/Quintal)", fontsize=11, labelpad=8)
    ax3.set_title("Top Realizing APMC Mandis with Discovery Spread (Matplotlib)", fontsize=13, fontweight='bold', pad=12)
    ax3.legend(loc='lower right', frameon=True)
    
    # Add value annotations on bars
    for bar in bars:
        width = bar.get_width()
        ax3.text(width + 15, bar.get_y() + bar.get_height()/2, f"₹{int(width)}", va='center', ha='left', fontsize=9, fontweight='semibold', color='#065f46')
    charts['top_mandis_spread'] = fig_to_base64(fig3)

    # Chart 4: Seaborn Scatter Plot of KMeans Clusters
    fig4, ax4 = plt.subplots(figsize=(8, 4.5))
    palette = sns.color_palette("Set2", k_clusters)
    sns.scatterplot(
        data=df,
        x='arrivals_tonnes',
        y='modal_price',
        hue='cluster',
        palette=palette,
        s=80,
        style='cluster',
        ax=ax4,
        alpha=0.9
    )
    ax4.set_title(f"Scikit-learn KMeans Market Segmentation ({k_clusters} Tiers)", fontsize=13, fontweight='bold', pad=12)
    ax4.set_xlabel("Daily Arrivals (Tonnes)", fontsize=11, labelpad=8)
    ax4.set_ylabel("Modal Price (₹/Quintal)", fontsize=11, labelpad=8)
    ax4.legend(title='KMeans Tier', loc='best', frameon=True)
    charts['kmeans_clusters'] = fig_to_base64(fig4)

    # Clean records table to return
    cleaned_records = df[[
        'market', 'district', 'commodity', 'modal_price', 'min_price', 'max_price', 'price_spread', 'arrivals_tonnes', 'cluster'
    ]].to_dict(orient='records')

    return {
        "status": "success",
        "records_count": n_samples,
        "summary_stats": summary_stats,
        "regression_diagnostics": regression_diagnostics,
        "cluster_summaries": cluster_summaries,
        "top_districts": top_districts,
        "charts": charts,
        "cleaned_records": cleaned_records[:25]  # Top 25 for UI table
    }

def main():
    parser = argparse.ArgumentParser(description="AgriMandi Python Data Analytics & ML Pipeline")
    parser.add_argument("--commodity", type=str, default="All", help="Commodity filter")
    parser.add_argument("--url", type=str, default="", help="Direct API endpoint URL to fetch live")
    args = parser.parse_args()

    # Read records from stdin or fetch from URL
    records = []
    if args.url:
        try:
            import urllib.request
            req = urllib.request.Request(
                args.url,
                headers={"User-Agent": "KisanMandi-Python-DataPipeline/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                payload = json.loads(response.read().decode('utf-8'))
                records = payload if isinstance(payload, list) else payload.get('records', payload.get('data', []))
        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Failed to fetch live data from API endpoint ({args.url}): {str(e)}",
                "metrics": {},
                "charts": {}
            }))
            sys.exit(1)
    else:
        try:
            input_data = sys.stdin.read().strip()
            if input_data:
                records = json.loads(input_data)
        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Failed to parse JSON input from stdin: {str(e)}",
                "metrics": {},
                "charts": {}
            }))
            sys.exit(1)

    result = run_pipeline(records, commodity_filter=args.commodity)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
