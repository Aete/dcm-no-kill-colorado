import * as d3 from "d3";
import { type RTOData } from "../../components/Dashboard/RTO/graph/RTO";

export async function getRTOData() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const processData = (data: d3.DSVRowArray<string>): RTOData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);
      const intakeStray = parseInt(row.intake_stray) || 0;
      const outcomeReturnToOwner = parseInt(row.outcome_return_to_owner) || 0;
      if (!acc[year]) {
        acc[year] = {
          intake_stray: 0,
          outcome_return_to_owner: 0,
        };
      }
      acc[year].intake_stray += intakeStray;
      acc[year].outcome_return_to_owner += outcomeReturnToOwner;

      return acc;
    }, {} as RTOData);
  };
  // Group by year and sum intake_stray and outcome_return_to_owner
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

export async function getCountyRTOData() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const countyMappingData = await d3.csv("/facility_name_county_mapping.csv");

  // Get unique counties
  const uniqueCounties = [
    ...new Set(countyMappingData.map((row) => row.county)),
  ].filter((county) => county);

  const processData = (data: d3.DSVRowArray<string>): RTOData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);
      const intakeStray = parseInt(row.intake_stray) || 0;
      const outcomeReturnToOwner = parseInt(row.outcome_return_to_owner) || 0;
      if (!acc[year]) {
        acc[year] = {
          intake_stray: 0,
          outcome_return_to_owner: 0,
        };
      }
      acc[year].intake_stray += intakeStray;
      acc[year].outcome_return_to_owner += outcomeReturnToOwner;

      return acc;
    }, {} as RTOData);
  };

  // Create county data structure as array
  const countyRTOData: Array<{
    county: string;
    data: { total: RTOData; dog: RTOData; cat: RTOData };
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

    countyRTOData.push({
      county: county,
      data: {
        total: totalData,
        dog: dogData,
        cat: catData,
      },
    });
  });

  // Filter counties that have valid data for 2020-2024 period
  return countyRTOData
    .filter((county) => {
      const totalData = county.data.total;

      // Check if any year from 2020-2024 has both intake and return data
      for (let year = 2020; year <= 2024; year++) {
        if (
          totalData[year] &&
          totalData[year].intake_stray > 0 &&
          totalData[year].outcome_return_to_owner > 0
        ) {
          return true;
        }
      }
      return false;
    })
    .sort((a, b) => {
      const aIntake = a.data.total[2024]?.intake_stray || 0;
      const aReturn = a.data.total[2024]?.outcome_return_to_owner || 0;
      const bIntake = b.data.total[2024]?.intake_stray || 0;
      const bReturn = b.data.total[2024]?.outcome_return_to_owner || 0;

      // Calculate RTO ratios (return rate)
      const aRatio = aIntake > 0 ? aReturn / aIntake : 0;
      const bRatio = bIntake > 0 ? bReturn / bIntake : 0;

      // Normal sorting by RTO ratio (higher ratio first)
      return bRatio - aRatio;
    });
}
