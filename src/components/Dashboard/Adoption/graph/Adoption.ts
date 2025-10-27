import * as d3 from "d3";
import { blueGray, blueGray100, white } from "../../../../utils/color";
import type { AdoptionProcessedData } from "../../../../utils/dataProcessing/adoptionData";

export class Adoption {
  private element: HTMLElement;
  private width: number;
  private height: number;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;
  private margin = { top: 20, right: 20, bottom: 20, left: 20 };
  private data: AdoptionProcessedData | null | undefined;
  private catColor: string;
  private dogColor: string;
  private total: boolean = true;

  constructor(
    element: HTMLElement,
    width: number = 400,
    height: number = 300,
    data: AdoptionProcessedData | null | undefined,
    total: boolean = true
  ) {
    this.element = element;
    this.width = width;
    this.height = height;
    this.data = data;
    this.catColor = "#27397e";
    this.dogColor = "#c2303a";
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

  private createPieChart(
    yearGroup: d3.Selection<SVGGElement, any, null, undefined>,
    pieData: Array<{ label: string; value: number; color: string }>,
    position: { x: number; y: number },
    radius: number = 10,
    scaleFactor: number = 1
  ) {
    if (pieData.length === 0) return;

    const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);
    if (totalValue === 0) return;

    // Create pie chart group
    const pieGroup = yearGroup
      .append("g")
      .attr("class", "pie-chart")
      .attr("transform", `translate(${position.x}, ${position.y})`);

    // Create pie generator
    const pie = d3
      .pie<any>()
      .value((d: any) => d.value)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .sort((a: any, b: any) => {
        if (a.label === "Adopted") return -1;
        if (b.label === "Adopted") return 1;
        return 0;
      });

    // Create arc generator
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create pie slices
    pieGroup
      .selectAll(".pie-slice")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("class", "pie-slice")
      .attr("d", arc as any)
      .attr("fill", (d: any) => d.data.color)
      .attr("stroke", (d: any) =>
        d.data.color === white ? blueGray : d.data.color
      )
      .attr("stroke-width", Math.max(0.3, 0.5 * scaleFactor));
  }

  public render(data: AdoptionProcessedData) {
    if (!data) return;
    this.data = data;
    if (!this.svg) return;
    this.svg.selectAll("*").remove(); // Clear previous renderings

    const g = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const width = this.width - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;
    const fontSize = this.total ? 13 : 10;

    // Calculate responsive sizes based on width
    const baseWidth = 400; // Reference width
    const scaleFactor = width / baseWidth;

    // Set domain based on total flag
    const yearDomain = this.total ? [2015, 2024] : [2020, 2024];
    const xScale = d3.scaleLinear().range([0, width]).domain(yearDomain);
    const yScale = d3
      .scaleLinear()
      .range([height, Math.max(50, this.total ? 150 : 300 * scaleFactor)]);

    // adoption chart - total
    const totalData = this.data?.total;
    const catData = this.data?.cat;
    const dogData = this.data?.dog;

    const chartData = Object.keys(totalData)
      .map((year) => parseInt(year))
      .filter((year) => (this.total ? true : year >= 2020))
      .map((year) => ({
        year: year,
        adoptionTotal: totalData[year]?.outcome_adoption || 0,
        adoptionCat: catData[year]?.outcome_adoption || 0,
        adoptionDog: dogData[year]?.outcome_adoption || 0,
        adoptionOther:
          (totalData[year]?.outcome_adoption || 0) -
          (dogData[year]?.outcome_adoption || 0) -
          (catData[year]?.outcome_adoption || 0),
        intakeTotal: totalData[year]?.intake_total || 0,
        intakeCat: catData[year]?.intake_total || 0,
        intakeDog: dogData[year]?.intake_total || 0,
      }))
      .filter((d) => d.intakeTotal > 0);

    // Check if there's any data for 2020-2024 range (for mini charts)
    if (!this.total && chartData.length === 0) {
      // Display "No data available" message
      g.append("text")
        .text("No data available")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", blueGray)
        .attr("font-style", "italic");
      return;
    }

    // Update yScale domain based on actual data
    const maxAdoptionValue =
      d3.max(
        chartData,
        (d) => d.adoptionCat + d.adoptionDog + d.adoptionOther
      ) || 0;
    yScale.domain([0, this.total ? maxAdoptionValue : 15000]);

    // stacked bar chart - adoption cat and dog
    const barWidth = Math.max(14, 14 * scaleFactor); // Minimum 14px, scales with width

    // Horizontal axis lines - pie (responsive positioning)
    const axisGap = this.total ? 20 : 60;
    const axisPositions = [
      20,
      20 + axisGap * scaleFactor,
      20 + axisGap * scaleFactor * 2,
    ];
    g.append("g")
      .attr("class", "pie-axis")
      .selectAll(".pie-axis-line")
      .data(axisPositions)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", (d) => d)
      .attr("x2", width)
      .attr("y2", (d) => d)
      .attr("stroke", blueGray100)
      .attr("stroke-width", Math.max(0.3, 0.5 * scaleFactor));

    // Create year groups
    const yearGroups = g
      .selectAll(".year-group")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "year-group")
      .attr("transform", (d) => `translate(${xScale(d.year)}, 0)`);

    // Cat bars (bottom layer) within each year group
    yearGroups
      .append("rect")
      .attr("class", "bar-cat")
      .attr("x", -barWidth / 2)
      .attr("y", (d) => yScale(d.adoptionCat))
      .attr("width", barWidth)
      .attr("height", (d) => height - yScale(d.adoptionCat))
      .attr("fill", this.catColor);

    // Dog bars (middle layer) within each year group
    yearGroups
      .append("rect")
      .attr("class", "bar-dog")
      .attr("x", -barWidth / 2)
      .attr("y", (d) => yScale(d.adoptionCat + d.adoptionDog))
      .attr("width", barWidth)
      .attr(
        "height",
        (d) => yScale(d.adoptionCat) - yScale(d.adoptionCat + d.adoptionDog)
      )
      .attr("fill", this.dogColor);

    // Other bars (top layer) within each year group
    yearGroups
      .append("rect")
      .attr("class", "bar-other")
      .attr("x", -barWidth / 2)
      .attr("y", (d) => yScale(d.adoptionCat + d.adoptionDog + d.adoptionOther))
      .attr("width", barWidth)
      .attr(
        "height",
        (d) =>
          yScale(d.adoptionCat + d.adoptionDog) -
          yScale(d.adoptionCat + d.adoptionDog + d.adoptionOther)
      )
      .attr("fill", blueGray100);

    // Add pie chart - ratio between stray and returned total
    const pieRadius = this.total ? 8 : 6; // Minimum 6px, scales with width

    yearGroups.each((d, i, nodes) => {
      const yearGroup = d3.select(nodes[i] as SVGGElement);

      // Pie chart data for this year
      // Logic check: intakeTotal should be >= adoptionTotal (can't adopt more than intake)

      const notAdoptedTotal = Math.max(0, d.intakeTotal - d.adoptionTotal);
      const adoptedTotal = d.adoptionTotal;

      const notAdoptedCat = Math.max(0, d.intakeCat - d.adoptionCat);
      const notAdoptedDog = Math.max(0, d.intakeDog - d.adoptionDog);
      const adoptedCat = d.adoptionCat;
      const adoptedDog = d.adoptionDog;

      // Only show pie chart if there's meaningful data
      const pieDataTotal = [
        { label: "Adopted", value: adoptedTotal, color: blueGray },
        { label: "Not Adopted", value: notAdoptedTotal, color: white },
      ].filter((item) => item.value > 0); // Filter out zero values

      const pieDataCat = [
        { label: "Adopted", value: adoptedCat, color: this.catColor },
        { label: "Not Adopted", value: notAdoptedCat, color: white },
      ].filter((item) => item.value > 0); // Filter out zero values

      const pieDataDog = [
        { label: "Adopted", value: adoptedDog, color: this.dogColor },
        { label: "Not Adopted", value: notAdoptedDog, color: white },
      ].filter((item) => item.value > 0); // Filter out zero values

      // Create pie charts using the reusable function (responsive positioning)
      // Total pie chart (center, above bars)

      this.createPieChart(
        yearGroup,
        pieDataTotal,
        { x: 0, y: axisPositions[0] },
        pieRadius,
        scaleFactor
      );

      // Optional: Cat pie chart (bottom position, smaller)
      if (pieDataCat.length > 0) {
        this.createPieChart(
          yearGroup,
          pieDataCat,
          { x: 0, y: axisPositions[2] },
          pieRadius,
          scaleFactor
        );
      }

      // Optional: Dog pie chart (middle position, smaller)
      if (pieDataDog.length > 0) {
        this.createPieChart(
          yearGroup,
          pieDataDog,
          { x: 0, y: axisPositions[1] },
          pieRadius,
          scaleFactor
        );
      }

      if (d.intakeTotal === 0) return;
      yearGroup
        .append("text")
        .text(`${((d.adoptionTotal / d.intakeTotal) * 100).toFixed(0)}%`)
        .attr("y", -3 * scaleFactor)
        .attr("text-anchor", "middle")
        .attr("font-size", `${fontSize}px`);
    });

    // x-axis, text labels
    yearGroups
      .append("text")
      .text((d) => `'${d.year.toString().slice(-2)}`)
      .attr("y", height + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", `${fontSize}px`)
      .attr("fill", blueGray);

    // Add x-axis line
    g.append("line")
      .attr("x1", -20)
      .attr("y1", height)
      .attr("x2", width + 20)
      .attr("y2", height)
      .attr("stroke", blueGray)
      .attr("stroke-width", 1);

    if (this.total) {
      yearGroups
        .append("text")
        .text((d) => `${(d.adoptionTotal / 1000).toFixed(1)}k`)
        .attr(
          "y",
          (d) => yScale(d.adoptionCat + d.adoptionDog) - 10 * scaleFactor
        )
        .attr("text-anchor", "middle")
        .attr("font-size", `${fontSize}px`)
        .attr("fill", blueGray);
    } else {
      yearGroups
        .append("text")
        .text((d) => d.adoptionTotal)
        .attr(
          "y",
          (d) => yScale(d.adoptionCat + d.adoptionDog) - 10 * scaleFactor
        )
        .attr("text-anchor", "middle")
        .attr("font-size", `${fontSize}px`)
        .attr("fill", blueGray);
    }
  }

  public updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this.svg && this.data) {
      this.svg.attr("width", width).attr("height", height);
      this.render(this.data); // Re-render with new dimensions
    }
  }
}
