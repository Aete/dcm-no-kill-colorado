import * as d3 from "d3";

// Type definition for TNO data structure
interface IntakeRecord {
  intake_stray: number;
  intake_relinquished: number;
  intake_in_state_transfer: number;
  intake_out_of_state_transfer: number;
  intake_other: number;
}

export interface IntakeData {
  [year: number]: IntakeRecord;
}

export interface IntakeProcessedData {
  total: IntakeData;
}

export async function getIntakeDataTotal() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const processData = (data: d3.DSVRowArray<string>): IntakeData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);
      const intakeStray = parseInt(row.intake_stray) || 0;
      const intakeRelinquished = parseInt(row.intake_relinquished) || 0;
      const intakeInStateTransfer = parseInt(row.intake_in_state_transfer) || 0;
      const intakeOutOfStateTransfer =
        parseInt(row.intake_out_of_state_transfer) || 0;
      const intakeOther = parseInt(row.intake_other) || 0;

      if (!acc[year]) {
        acc[year] = {
          intake_stray: 0,
          intake_relinquished: 0,
          intake_in_state_transfer: 0,
          intake_out_of_state_transfer: 0,
          intake_other: 0,
        };
      }
      acc[year].intake_stray += intakeStray;
      acc[year].intake_relinquished += intakeRelinquished;
      acc[year].intake_in_state_transfer += intakeInStateTransfer;
      acc[year].intake_out_of_state_transfer += intakeOutOfStateTransfer;
      acc[year].intake_other += intakeOther;

      return acc;
    }, {} as IntakeData);
  };

  // Group by year and sum all intake categories
  const yearlyData = processData(data);

  return {
    total: yearlyData,
  };
}

export async function getCountyIntakeData() {
  const data = await d3.csv("/nkc-dataset-nick.csv");
  const countyMappingData = await d3.csv("/facility_name_county_mapping.csv");

  // Get unique counties
  const uniqueCounties = [
    ...new Set(countyMappingData.map((row) => row.county)),
  ].filter((county) => county);

  const processData = (data: d3.DSVRowArray<string>): IntakeData => {
    return data.reduce((acc, row) => {
      const year = parseInt(row.year);
      const intakeStray = parseInt(row.intake_stray) || 0;
      const intakeRelinquished = parseInt(row.intake_relinquished) || 0;
      const intakeInStateTransfer = parseInt(row.intake_in_state_transfer) || 0;
      const intakeOutOfStateTransfer =
        parseInt(row.intake_out_of_state_transfer) || 0;
      const intakeOther = parseInt(row.intake_other) || 0;

      if (!acc[year]) {
        acc[year] = {
          intake_stray: 0,
          intake_relinquished: 0,
          intake_in_state_transfer: 0,
          intake_out_of_state_transfer: 0,
          intake_other: 0,
        };
      }
      acc[year].intake_stray += intakeStray;
      acc[year].intake_relinquished += intakeRelinquished;
      acc[year].intake_in_state_transfer += intakeInStateTransfer;
      acc[year].intake_out_of_state_transfer += intakeOutOfStateTransfer;
      acc[year].intake_other += intakeOther;

      return acc;
    }, {} as IntakeData);
  };

  // Create county data structure as array
  const countyIntakeData: Array<{
    county: string;
    data: IntakeProcessedData;
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

    // Process total data for this county
    const totalData = processData(countyDataFiltered as d3.DSVRowArray<string>);

    countyIntakeData.push({
      county: county,
      data: {
        total: totalData,
      },
    });
  });

  // Filter counties that have valid data for 2020-2024 period
  return countyIntakeData
    .filter((county) => {
      const totalData = county.data.total;

      // Check if any year from 2020-2024 has intake data
      for (let year = 2020; year <= 2024; year++) {
        if (
          totalData[year] &&
          (totalData[year].intake_stray > 0 ||
            totalData[year].intake_relinquished > 0 ||
            totalData[year].intake_in_state_transfer > 0 ||
            totalData[year].intake_out_of_state_transfer > 0 ||
            totalData[year].intake_other > 0)
        ) {
          return true;
        }
      }
      return false;
    })
    .sort((a, b) => {
      const aTotalIntake =
        (a.data.total[2024]?.intake_stray || 0) +
        (a.data.total[2024]?.intake_relinquished || 0) +
        (a.data.total[2024]?.intake_in_state_transfer || 0) +
        (a.data.total[2024]?.intake_out_of_state_transfer || 0) +
        (a.data.total[2024]?.intake_other || 0);
      const bTotalIntake =
        (b.data.total[2024]?.intake_stray || 0) +
        (b.data.total[2024]?.intake_relinquished || 0) +
        (b.data.total[2024]?.intake_in_state_transfer || 0) +
        (b.data.total[2024]?.intake_out_of_state_transfer || 0) +
        (b.data.total[2024]?.intake_other || 0);

      // Sort by total intake (higher intake first)
      return bTotalIntake - aTotalIntake;
    });
}
