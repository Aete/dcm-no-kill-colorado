import * as d3 from "d3";
import {
  blueGray,
  blueGray100,
  blueGray300,
  blueGray500,
  white,
} from "../../../../utils/color";
import type { TNOProcessedData } from "../../../../utils/dataProcessing/tnoData";

export class TNO {
  private element: HTMLElement;
  private width: number;
  private height: number;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;

  private data: TNOProcessedData | null | undefined;
  private total: boolean;

  // Colors for different negative outcomes
  private colors = {
    missing: blueGray100,
    euthanasia: blueGray500,
    deaths: blueGray,
  };

  constructor(
    element: HTMLElement,
    width: number = 800,
    height: number = 400,
    data: TNOProcessedData | null | undefined,
    total: boolean = true
  ) {
    this.element = element;
    this.width = width;
    this.height = height;
    this.data = data;
    this.total = total;

    this.init();
  }

  private init() {
    this.svg = d3
      .select(this.element)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
  }

  public render(data: TNOProcessedData) {
    if (!data) return;
    this.data = data;
    if (!this.svg) return;
    this.svg.selectAll("*").remove(); // Clear previous renderings

    // Adjust margin based on total flag
    const currentMargin = this.total
      ? { top: 80, right: 20, bottom: 20, left: 20 }
      : { top: 20, right: 20, bottom: 20, left: 20 };

    // Create main container
    const mainGroup = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${currentMargin.left},${currentMargin.top})`
      );

    const width = this.width - currentMargin.left - currentMargin.right;
    const height = this.height - currentMargin.top - currentMargin.bottom;

    // Create chart group (moved down by 50px for total, 0px for non-total)
    const chartOffset = this.total ? 50 : 0;
    const g = mainGroup
      .append("g")
      .attr("transform", `translate(0, ${chartOffset})`);

    // Prepare chart data
    const yearFilter = this.total
      ? (year: number) => year >= 2015
      : (year: number) => year >= 2020 && year <= 2024;
    const years = Object.keys(data.total)
      .map((year) => parseInt(year))
      .filter(yearFilter)
      .sort((a, b) => a - b);

    const chartData = years.map((year) => ({
      year,
      totalIntake: data.total[year]?.intake_out_of_state_transfer || 0,
      missing: data.total[year]?.outcome_missing_or_stolen || 0,
      euthanasia: data.total[year]?.outcome_euthanasia || 0,
      deaths: data.total[year]?.outcome_deaths || 0,
    }));

    // Find max values for scaling
    const maxPositive = d3.max(chartData, (d) => d.totalIntake) || 0;
    const maxNegative =
      d3.max(chartData, (d) => d.missing + d.euthanasia + d.deaths) || 0;

    const maximumValue = this.total ? Math.max(maxPositive, maxNegative) : 4000;
    // Scales
    const xScale = d3
      .scaleBand()
      .domain(
        this.total
          ? years.map(String)
          : [2020, 2021, 2022, 2023, 2024].map(String)
      )
      .range([0, width])
      .padding(0.4)
      .paddingOuter(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, maximumValue])
      .range([height / 2, 20]);

    const yScaleNegative = d3
      .scaleLinear()
      .domain([0, maximumValue])
      .range([height / 2, height - 20]);

    // Helper function to format numbers
    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      }
      return num.toString();
    };

    // Create positive bars (intake) - single color for total intake
    g.selectAll(`.bar-positive-totalIntake`)
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", `bar-positive-totalIntake`)
      .attr("x", (d) => (xScale(String(d.year)) || 0) + 0.5)
      .attr("y", (d) => yScale(d.totalIntake))
      .attr("width", xScale.bandwidth() - 1)
      .attr("height", (d) => height / 2 - yScale(d.totalIntake))
      .attr("fill", white)
      .attr("stroke", blueGray300)
      .attr("stroke-width", 0.5)
      .attr("shape-rendering", "crispEdges");

    // Add intake value labels on top of positive bars
    g.selectAll(`.intake-label`)
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", `intake-label`)
      .attr("x", (d) => (xScale(String(d.year)) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.totalIntake) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", blueGray)
      .text((d) => formatNumber(d.totalIntake));

    // Add year labels above intake labels (only for specific years)
    const displayYears = this.total ? [2015, 2020, 2024] : [2020, 2024];
    g.selectAll(`.year-label`)
      .data(displayYears)
      .enter()
      .append("text")
      .attr("class", `year-label`)
      .attr("x", (d) => (xScale(String(d)) || 0) + xScale.bandwidth() / 2 - 2)
      .attr("y", (d) => (this.total ? -20 : -5))
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", blueGray)
      .text((d) => `'${String(d).slice(-2)}`);

    // Create negative stack
    const negativeStack = d3
      .stack<any>()
      .keys(["missing", "euthanasia", "deaths"])
      .offset(d3.stackOffsetNone);

    const negativeData = negativeStack(chartData);

    // Create negative bars (outcome negative) - stacked bars
    const negativeColorMap: { [key: string]: string } = {
      missing: this.colors.missing,
      euthanasia: this.colors.euthanasia,
      deaths: this.colors.deaths,
    };

    negativeData.forEach((series) => {
      g.selectAll(`.bar-negative-${series.key}`)
        .data(series)
        .enter()
        .append("rect")
        .attr("class", `bar-negative-${series.key}`)
        .attr("x", (_, i) => xScale(String(years[i])) || 0)
        .attr("y", (d) => yScaleNegative(d[0]))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => yScaleNegative(d[1]) - yScaleNegative(d[0]))
        .attr("fill", negativeColorMap[series.key]);
    });

    // Add negative outcome labels below bars
    const labelMapping: { [key: string]: string } = {
      missing: "M",
      euthanasia: "E",
      deaths: "D",
    };

    chartData.forEach((d) => {
      const year = d.year;
      const isFirstYear = this.total ? year === 2015 : year === 2020;
      const labelPosition = this.total ? height - 70 : height - 10;

      let yOffset = 0; // Track vertical position for stacking labels

      ["missing", "euthanasia", "deaths"].forEach((key) => {
        const value = d[key as keyof typeof d] as number;
        const formattedValue = formatNumber(value);

        if (isFirstYear) {
          // Add abbreviation on the left for first year
          g.append("text")
            .attr("x", (xScale(String(year)) || 0) - 15)
            .attr("y", labelPosition + yOffset)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", blueGray)
            .text(`(${labelMapping[key]})`);
        }

        // Add value in the center
        g.append("text")
          .attr("x", (xScale(String(year)) || 0) + xScale.bandwidth() / 2)
          .attr("y", labelPosition + yOffset)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", blueGray)
          .text(formattedValue);

        yOffset += this.total ? 20 : 15; // Stack labels vertically
      });
    });

    // Add zero line
    g.append("line")
      .attr("x1", -10)
      .attr("x2", width)
      .attr("y1", height / 2)
      .attr("y2", height / 2)
      .attr("stroke", blueGray)
      .attr("stroke-width", 2);

    // Add legend (only if total is true)
    if (this.total) {
      const legend = mainGroup
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 300}, -70)`);

      // Intake column
      const intakeGroup = legend.append("g").attr("class", "intake-legend");

      intakeGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", blueGray)
        .text("Intake");

      intakeGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", 8)
        .attr("width", 13)
        .attr("height", 13)
        .attr("fill", white)
        .attr("stroke", blueGray300)
        .attr("stroke-width", 0.5);

      intakeGroup
        .append("text")
        .attr("x", 18)
        .attr("y", 19)
        .attr("font-size", "10px")
        .attr("fill", blueGray)
        .text("Out-of-State Transfer");

      // Outcome column
      const outcomeGroup = legend
        .append("g")
        .attr("class", "outcome-legend")
        .attr("transform", "translate(150, 0)");

      outcomeGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", blueGray)
        .text("Negative Outcomes");

      const outcomeData = [
        {
          key: "missing",
          color: this.colors.missing,
          label: "Missing/Stolen (M)",
        },
        {
          key: "euthanasia",
          color: this.colors.euthanasia,
          label: "Euthanasia (E)",
        },
        {
          key: "deaths",
          color: this.colors.deaths,
          label: "Deaths (D)",
        },
      ];

      const outcomeItems = outcomeGroup
        .selectAll(".outcome-item")
        .data(outcomeData)
        .enter()
        .append("g")
        .attr("class", "outcome-item")
        .attr("transform", (_, i) => `translate(0, ${8 + i * 18})`);

      outcomeItems
        .append("rect")
        .attr("width", 13)
        .attr("height", 13)
        .attr("fill", (d) => d.color);

      outcomeItems
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("font-size", "10px")
        .attr("fill", blueGray)
        .text((d) => d.label);
    }
  }

  public updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this.svg && this.data) {
      this.svg.attr("width", width).attr("height", height);
      this.render(this.data);
    }
  }
}
