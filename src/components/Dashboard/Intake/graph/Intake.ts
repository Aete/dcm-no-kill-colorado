import * as d3 from "d3";
import { blueGray, blueGray100, blueGray500 } from "../../../../utils/color";
import type { IntakeProcessedData } from "../../../../utils/dataProcessing/intakeData";

export class Intake {
  private element: HTMLElement;
  private width: number;
  private height: number;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;

  private data: IntakeProcessedData | null | undefined;
  private total: boolean;

  // Colors for different intake categories
  private colors = {
    total: blueGray100,
    stray: blueGray500,
    relinquished: blueGray,
  };

  constructor(
    element: HTMLElement,
    width: number = 800,
    height: number = 400,
    data: IntakeProcessedData | null | undefined,
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

  public render(data: IntakeProcessedData) {
    if (!data) return;
    this.data = data;
    if (!this.svg) return;
    this.svg.selectAll("*").remove(); // Clear previous renderings

    // Adjust margin based on total flag
    const currentMargin = this.total
      ? { top: 120, right: 20, bottom: 20, left: 60 }
      : { top: 80, right: 20, bottom: 20, left: 40 };

    // Create main container
    const mainGroup = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${currentMargin.left},${currentMargin.top})`
      );

    const width = this.width - currentMargin.left - currentMargin.right;
    const height = this.height - currentMargin.top - currentMargin.bottom;

    // Create chart group (moved up by 85px for total, -85px for non-total)
    const chartOffset = 0;
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

    const chartData = years.map((year) => {
      const stray = data.total[year]?.intake_stray || 0;
      const relinquished = data.total[year]?.intake_relinquished || 0;
      const other =
        (data.total[year]?.intake_in_state_transfer || 0) +
        (data.total[year]?.intake_out_of_state_transfer || 0) +
        (data.total[year]?.intake_other || 0);

      return {
        year,
        total: stray + relinquished + other,
        stray,
        relinquished,
      };
    });

    // Find max values for scaling
    const maxTotalIntake = d3.max(chartData, (d) => d.total) || 0;

    const maximumValue = this.total ? maxTotalIntake : 25000;
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
      .range([height, 20]);

    // Helper function to format numbers
    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      }
      return num.toString();
    };

    // Create intake color map
    const intakeColorMap: { [key: string]: string } = {
      total: this.colors.total,
      stray: this.colors.stray,
      relinquished: this.colors.relinquished,
    };

    // Add grid lines first (so bars appear on top)
    const gridGroup = g.append("g").attr("class", "grid-lines");

    // Grid lines with different intervals based on total flag
    const gridInterval = this.total ? 20000 : 5000;
    const gridValues = [];
    for (let i = gridInterval; i <= maximumValue; i += gridInterval) {
      gridValues.push(i);
    }

    gridValues.forEach((value) => {
      // Dashed grid line
      gridGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(value))
        .attr("y2", yScale(value))
        .attr("stroke", blueGray)
        .attr("stroke-width", this.total ? 0.5 : 0.3)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.3);

      // Grid value text
      gridGroup
        .append("text")
        .attr("x", -5)
        .attr("y", yScale(value))
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-size", "9px")
        .attr("fill", blueGray)
        .attr("opacity", 0.6)
        .text(formatNumber(value));
    });

    // Create multiple bars for total, stray, relinquished (drawn on top of grid)
    const categories = ["total", "stray", "relinquished"];
    const barWidth = xScale.bandwidth() / categories.length;
    const barPadding = 0.5;

    categories.forEach((category, index) => {
      g.selectAll(`.bar-${category}`)
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", `bar-${category}`)
        .attr(
          "x",
          (d) => (xScale(String(d.year)) || 0) + index * barWidth + barPadding
        )
        .attr("y", (d) => yScale(d[category as keyof typeof d] as number))
        .attr("width", barWidth - barPadding * 2)
        .attr(
          "height",
          (d) => height - yScale(d[category as keyof typeof d] as number)
        )
        .attr("fill", intakeColorMap[category]);
    });

    // Add table-like grid above chart
    const tableGroup = mainGroup
      .append("g")
      .attr("class", "data-table")
      .attr("transform", `translate(0, ${chartOffset - 50})`);

    // Table dimensions
    const rowHeight = 15;

    // Table headers (categories)
    const categoryLabelsMap = {
      total: "Total",
      stray: "S",
      relinquished: "R",
    };

    categories.forEach((category, rowIndex) => {
      // Category label in first column (moved more to the left)
      tableGroup
        .append("text")
        .attr("x", -30)
        .attr("y", (rowIndex + 1) * rowHeight)
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", blueGray)
        .text(categoryLabelsMap[category as keyof typeof categoryLabelsMap]);

      // Values for each year - aligned with chart bars
      chartData.forEach((d) => {
        const value = d[category as keyof typeof d] as number;
        // Use the same x positioning as the bars
        const barGroupCenter =
          (xScale(String(d.year)) || 0) + xScale.bandwidth() / 2;
        tableGroup
          .append("text")
          .attr("x", barGroupCenter)
          .attr("y", (rowIndex + 1) * rowHeight)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", blueGray)
          .text(formatNumber(value));
      });
    });

    // Year labels positioned above the table
    chartData.forEach((d) => {
      tableGroup
        .append("text")
        .attr("x", (xScale(String(d.year)) || 0) + xScale.bandwidth() / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", blueGray)
        .text(`'${String(d.year).slice(-2)}`);
    });

    // Y=0 baseline (more prominent)
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", blueGray)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8);

    // Add legend (only when total is true)
    if (this.total) {
      const legend = mainGroup
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 180}, -110)`);

      const legendData = [
        { key: "total", label: "Total", color: this.colors.total },
        { key: "stray", label: "Stray", color: this.colors.stray },
        {
          key: "relinquished",
          label: "Relinquished",
          color: this.colors.relinquished,
        },
      ];

      const legendItems = legend
        .selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (_, i) => `translate(${i * 50}, 0)`);

      legendItems
        .append("rect")
        .attr("width", 8)
        .attr("height", 8)
        .attr("fill", (d) => d.color);

      legendItems
        .append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr("dy", "0.35em")
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
