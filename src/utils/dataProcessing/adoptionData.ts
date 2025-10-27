import * as d3 from "d3";

// Type definition for Adoption data structure
interface AdoptionRecord {
  intake_total: number;
  outcome_adoption: number;
}

export interface AdoptionData {
  [year: number]: AdoptionRecord;
}

export interface AdoptionProcessedData {
  total: AdoptionData;
  dog: AdoptionData;
  cat: AdoptionData;
}

const intakeColumn: string[] = [
  "intake_stray",
  "intake_relinquished",
  "intake_in_state_transfer",
  "intake_out_of_state_transfer",
  "intake_other",
];

export async function getAdoptionData() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const processData = (data: d3.DSVRowArray<string>): AdoptionData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);

      // Calculate intakeTotal by summing all intake columns
      const intakeTotal = intakeColumn.reduce((sum, column) => {
        return sum + (parseInt(row[column]) || 0);
      }, 0);

      const outcomeAdoption = parseInt(row.outcome_adoption) || 0;

      if (!acc[year]) {
        acc[year] = {
          intake_total: 0,
          outcome_adoption: 0,
        };
      }

      acc[year].intake_total += intakeTotal;
      acc[year].outcome_adoption += outcomeAdoption;

      return acc;
    }, {} as AdoptionData);
  };
  // Group by year and sum intake_total and outcome_adoption
  const yearlyData = processData(data);
  const yearlyDataDog = processData(
    data.filter(
      (row) => row.animal_category === "dog"
    ) as d3.DSVRowArray<string>
  );
  const yearlyDataCat = processData(
    data.filter(
      (row) => row.animal_category === "cat"
    ) as d3.DSVRowArray<string>
  );

  return {
    total: yearlyData,
    dog: yearlyDataDog,
    cat: yearlyDataCat,
  };
}

export async function getCountyAdoptionData() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const countyMappingData = await d3.csv("/facility_name_county_mapping.csv");

  // Get unique counties
  const uniqueCounties = [
    ...new Set(countyMappingData.map((row) => row.county)),
  ].filter((county) => county);

  const processData = (data: d3.DSVRowArray<string>): AdoptionData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);

      // Calculate intakeTotal by summing all intake columns
      const intakeTotal = intakeColumn.reduce((sum, column) => {
        return sum + (parseInt(row[column]) || 0);
      }, 0);

      const outcomeAdoption = parseInt(row.outcome_adoption) || 0;

      if (!acc[year]) {
        acc[year] = {
          intake_total: 0,
          outcome_adoption: 0,
        };
      }

      acc[year].intake_total += intakeTotal;
      acc[year].outcome_adoption += outcomeAdoption;

      return acc;
    }, {} as AdoptionData);
  };

  // Create county data structure as array
  const countyAdoptionData: Array<{
    county: string;
    data: AdoptionProcessedData;
  }> = [];

  uniqueCounties.forEach((county) => {
    // Filter data for this county
    const countyDataFiltered = data.filter((row) => {
      const facilityArray = countyMappingData.filter(
        (mapping) => mapping.county === county
      );
      return facilityArray.some(
        (mapping) => mapping.facility_name === row.Facility_Name
      );
    });

    // if no data for this county, skip
    if (countyDataFiltered.length === 0) {
      return;
    }

    // Process total, dog, and cat data for this county
    const totalData = processData(countyDataFiltered as d3.DSVRowArray<string>);
    const dogData = processData(
      countyDataFiltered.filter(
        (row) => row.animal_category === "dog"
      ) as d3.DSVRowArray<string>
    );
    const catData = processData(
      countyDataFiltered.filter(
        (row) => row.animal_category === "cat"
      ) as d3.DSVRowArray<string>
    );

    countyAdoptionData.push({
      county: county,
      data: {
        total: totalData,
        dog: dogData,
        cat: catData,
      },
    });
  });

  // Filter counties that have valid data for 2020-2024 period
  return countyAdoptionData
    .filter((county) => {
      const totalData = county.data.total;

      // Check if any year from 2020-2024 has both intake and adoption data
      for (let year = 2020; year <= 2024; year++) {
        if (
          totalData[year] &&
          totalData[year].intake_total > 0 &&
          totalData[year].outcome_adoption > 0
        ) {
          return true;
        }
      }
      return false;
    })
    .sort((a, b) => {
      const aIntake = a.data.total[2024]?.intake_total || 0;
      const aAdoption = a.data.total[2024]?.outcome_adoption || 0;
      const bIntake = b.data.total[2024]?.intake_total || 0;
      const bAdoption = b.data.total[2024]?.outcome_adoption || 0;

      // Calculate adoption ratios (adoption rate)
      const aRatio = aIntake > 0 ? aAdoption / aIntake : 0;
      const bRatio = bIntake > 0 ? bAdoption / bIntake : 0;

      // Sort by adoption ratio (higher ratio first)
      return bRatio - aRatio;
    });
}
