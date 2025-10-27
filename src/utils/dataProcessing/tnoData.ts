import * as d3 from "d3";

// Type definition for TNO data structure
interface TNORecord {
  intake_out_of_state_transfer: number;
  outcome_missing_or_stolen: number;
  outcome_euthanasia: number;
  outcome_deaths: number;
}

export interface TNOData {
  [year: number]: TNORecord;
}

export interface TNOProcessedData {
  total: TNOData;
  juvenileDog: TNOData;
  adultDog: TNOData;
  juvenileCat: TNOData;
  adultCat: TNOData;
}

export async function getTNODataTotal() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const processData = (data: d3.DSVRowArray<string>): TNOData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);
      const intakeOutOfStateTransfer =
        parseInt(row.intake_out_of_state_transfer) || 0;

      if (!acc[year]) {
        acc[year] = {
          intake_out_of_state_transfer: 0,
          outcome_missing_or_stolen: 0,
          outcome_euthanasia: 0,
          outcome_deaths: 0,
        };
      }
      acc[year].intake_out_of_state_transfer += intakeOutOfStateTransfer;
      acc[year].outcome_missing_or_stolen +=
        parseInt(row.outcome_missing_or_stolen) || 0;
      acc[year].outcome_euthanasia += parseInt(row.outcome_euthanasia) || 0;
      acc[year].outcome_deaths += parseInt(row.outcome_deaths) || 0;

      return acc;
    }, {} as TNOData);
  };

  // Group by year and sum intake_out_of_state_transfer and outcome_negative
  const yearlyData = processData(data);
  const yearlyDataJuvenileDog = processData(
    data.filter(
      (row) => row.animal_category === "dog" && row.animal_type === "juvenile"
    ) as d3.DSVRowArray<string>
  );
  const yearlyDataAdultDog = processData(
    data.filter(
      (row) => row.animal_category === "dog" && row.animal_type === "adult"
    ) as d3.DSVRowArray<string>
  );
  const yearlyDataJuvenileCat = processData(
    data.filter(
      (row) => row.animal_category === "cat" && row.animal_type === "juvenile"
    ) as d3.DSVRowArray<string>
  );
  const yearlyDataAdultCat = processData(
    data.filter(
      (row) => row.animal_category === "cat" && row.animal_type === "adult"
    ) as d3.DSVRowArray<string>
  );

  return {
    total: yearlyData,
    juvenileDog: yearlyDataJuvenileDog,
    adultDog: yearlyDataAdultDog,
    juvenileCat: yearlyDataJuvenileCat,
    adultCat: yearlyDataAdultCat,
  };
}

export async function getCountyTNOData() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const countyMappingData = await d3.csv("/facility_name_county_mapping.csv");

  // Get unique counties
  const uniqueCounties = [
    ...new Set(countyMappingData.map((row) => row.county)),
  ].filter((county) => county);

  const processData = (data: d3.DSVRowArray<string>): TNOData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);
      const intakeOutOfStateTransfer =
        parseInt(row.intake_out_of_state_transfer) || 0;
      const outcomeMissingOrStolen =
        parseInt(row.outcome_missing_or_stolen) || 0;
      const outcomeEuthanasia = parseInt(row.outcome_euthanasia) || 0;
      const outcomeDeaths = parseInt(row.outcome_deaths) || 0;

      if (!acc[year]) {
        acc[year] = {
          intake_out_of_state_transfer: 0,
          outcome_missing_or_stolen: 0,
          outcome_euthanasia: 0,
          outcome_deaths: 0,
        };
      }
      acc[year].intake_out_of_state_transfer += intakeOutOfStateTransfer;
      acc[year].outcome_missing_or_stolen += outcomeMissingOrStolen;
      acc[year].outcome_euthanasia += outcomeEuthanasia;
      acc[year].outcome_deaths += outcomeDeaths;

      return acc;
    }, {} as TNOData);
  };

  // Create county data structure as array
  const countyTNOData: Array<{
    county: string;
    data: { total: TNOData; dog: TNOData; cat: TNOData };
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

    countyTNOData.push({
      county: county,
      data: {
        total: totalData,
        dog: dogData,
        cat: catData,
      },
    });
  });

  // Filter counties that have valid data for 2020-2024 period
  return countyTNOData
    .filter(
      (county: {
        county: string;
        data: { total: TNOData; dog: TNOData; cat: TNOData };
      }) => {
        const totalData = county.data.total;

        // Check if any year from 2020-2024 has intake and negative outcome data
        for (let year = 2020; year <= 2024; year++) {
          if (
            totalData[year] &&
            totalData[year].intake_out_of_state_transfer > 0 &&
            (totalData[year].outcome_missing_or_stolen > 0 ||
              totalData[year].outcome_euthanasia > 0 ||
              totalData[year].outcome_deaths > 0)
          ) {
            return true;
          }
        }
        return false;
      }
    )
    .sort(
      (
        a: {
          county: string;
          data: { total: TNOData; dog: TNOData; cat: TNOData };
        },
        b: {
          county: string;
          data: { total: TNOData; dog: TNOData; cat: TNOData };
        }
      ) => {
        const aNegative =
          (a.data.total[2024]?.outcome_missing_or_stolen || 0) +
          (a.data.total[2024]?.outcome_euthanasia || 0) +
          (a.data.total[2024]?.outcome_deaths || 0);
        const bNegative =
          (b.data.total[2024]?.outcome_missing_or_stolen || 0) +
          (b.data.total[2024]?.outcome_euthanasia || 0) +
          (b.data.total[2024]?.outcome_deaths || 0);

        // Sort by TNO ratio (lower ratio first - better performance)
        return bNegative - aNegative;
      }
    );
}
