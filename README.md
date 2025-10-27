# No Kill Colorado - Annual Trends Dashboard

A comprehensive data visualization dashboard tracking animal shelter statistics across Colorado, helping to identify trends and support evidence-based decisions for animal welfare programs.

## Project Overview

This repository is for a data dashboard project that I participated in as a volunteer for one of Data Changemakers' projects.

This project was carried out through a collaboration between [Data Changemaker](https://www.datachangemakers.org/) and [No Kill Colorado](https://www.nokillcolorado.org/). Volunteers contributed by processing and visualizing data, helping to transform complex information into meaningful insights that support community-driven change.

The goal of this project is to identify and track trends across multiple years of Colorado shelter statistics. By understanding the patterns in intake, outcomes, transfers, and community impacts, we can better encourage, define, and support the programs and services that will help every healthy and treatable pet find a safe outcome.

## Features

- **Interactive Dashboard**: Visualize animal shelter data with multiple chart types and filters
- **Intake Analysis**: Track intake trends including stray, relinquished, and transfer data
- **Outcome Tracking**: Monitor adoption, return-to-owner (RTO), and transfer-no-outcome (TNO) statistics
- **County-Level Data**: Analyze data by specific counties or view statewide trends
- **Responsive Design**: Optimized for desktop, tablet, and mobile viewing

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Styled Components
- **Data Visualization**: D3.js
- **Data Processing**: Custom utilities for CSV processing and analysis

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Aete/dcm-no-kill-colorado.git
cd dcm-no-kill-colorado
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view the dashboard in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Data Sources

The dashboard uses processed data from Colorado animal shelters, including:

- Annual intake statistics by type (stray, relinquished, transfers)
- Outcome data (adoptions, return-to-owner, transfers)
- County-level facility mappings
- Multi-year trend analysis (2015-2024)

## Contributing

This project welcomes contributions from volunteers interested in animal welfare data analysis and visualization. Please reach out to [Data Changemaker](https://www.datachangemakers.org/) or [No Kill Colorado](https://www.nokillcolorado.org/) for more information on how to get involved.

## License

This project is developed for community benefit in support of animal welfare initiatives in Colorado.
