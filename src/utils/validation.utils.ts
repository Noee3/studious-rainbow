import path from 'path';
import fs from 'fs/promises';
import { Constants } from "./constants.utils";
import { Helpers } from "./helpers.utils";
import { tsMarkdown } from 'ts-markdown';
import { ReportData, ReportDataNormalized } from "../models/report.model";

interface ValidationSummary {
    passed: number;
    failed: number;
    failures: ReportDataNormalized[];
    success: ReportDataNormalized[];
}

export class ValidationUtils {
    static VERY_STRICT: bigint = 10n; // 0.1% 
    static STRICT: bigint = 100n; // 1%

    static async assertionWithTolerance(reports: ReportData[]): Promise<void> {
        if (reports.length === 0) {
            console.warn("No reports to validate.");
            return;
        }

        const failures: ReportDataNormalized[] = [];
        const successes: ReportDataNormalized[] = [];

        for (const report of reports) {
            const reportFailures: string[] = [];


            const tests = [
                {
                    name: "Collateral",
                    fromChain: report.fromChain.totalCollateralBase,
                    fromCalculation: report.fromCalculation.totalCollateralBase,
                    decimals: Constants.WAD,
                    tolerance: this.STRICT
                },
                {
                    name: "Debt",
                    fromChain: report.fromChain.totalDebtBase,
                    fromCalculation: report.fromCalculation.totalDebtBase,
                    decimals: Constants.WAD,
                    tolerance: this.STRICT
                },
                {
                    name: "Liquidation Threshold",
                    fromChain: report.fromChain.currentLiquidationThreshold,
                    fromCalculation: report.fromCalculation.currentLiquidationThreshold,
                    tolerance: this.STRICT
                },
                {
                    name: "LTV",
                    fromChain: report.fromChain.ltv,
                    fromCalculation: report.fromCalculation.ltv,
                    tolerance: this.STRICT
                },
                {
                    name: "Health Factor",
                    fromChain: report.fromChain.healthFactor,
                    fromCalculation: report.fromCalculation.healthFactor,
                    decimals: Constants.PRICE_FEED,
                    tolerance: this.VERY_STRICT
                }
            ];

            for (const test of tests) {
                if (!this.assertWithTolerance(test.fromChain, test.fromCalculation, test.tolerance, test.decimals || 0n)) {
                    reportFailures.push(`⚠️ ${test.name}`);
                }
            }

            if (reportFailures.length > 0) {
                report.flags = reportFailures;
                failures.push(report.normalize());
            } else {
                successes.push(report.normalize());
            }
        }

        const result: ValidationSummary = {
            passed: successes.length,
            failed: failures.length,
            failures: failures,
            success: successes
        };

        await this.generateMarkdownReport(result);
    }



    /*
    example 10_100 - 9_000;
    diff = 100;
    reference = 10_100;
    allowed = 10_100 * 100 / 10_000 = 101; 1% of 10_100 = 101;
    allowed = true
     */
    static assertWithTolerance(x: bigint, y: bigint, toleranceBasisPoints: bigint, decimals: bigint): boolean {
        if (x === 0n && y === 0n) return true;
        let normalizedX;
        let normalizedY;

        if (decimals != 0n) {
            normalizedX = x / decimals;
            normalizedY = y / decimals;
        } else {
            normalizedX = x;
            normalizedY = y;
        }

        const diff = normalizedX > normalizedY ? normalizedX - normalizedY : normalizedY - normalizedX;

        const reference = normalizedX > normalizedY ? normalizedX : normalizedY;

        const allowed = (reference * toleranceBasisPoints) / 10000n;

        return diff <= allowed;
    }

    static async generateMarkdownReport(result: ValidationSummary): Promise<void> {

        const total = result.passed + result.failed;
        const successRate = ((result.passed / total) * 100).toFixed(1);

        const failedRows = result.failures.flatMap(failure => {
            return [
                [
                    "CHAIN",
                    `[${Helpers.short(failure.user)}](https://defisim.xyz/?address=${failure.user})`,
                    failure.fromChain.totalCollateralBase,
                    failure.fromChain.totalDebtBase,
                    failure.fromChain.currentLiquidationThreshold,
                    failure.fromChain.ltv,
                    `**${failure.fromChain.healthFactor}**`
                ],
                [
                    "CALC",
                    `[${Helpers.short(failure.user)}](https://defisim.xyz/?address=${failure.user})`,
                    failure.fromCalculation.totalCollateralBase,
                    failure.fromCalculation.totalDebtBase,
                    failure.fromCalculation.currentLiquidationThreshold,
                    failure.fromCalculation.ltv,
                    `**${failure.fromCalculation.healthFactor}**`
                ]

            ];
        });

        // Flatten all rows from each success into a single array of rows
        const successRows = result.success.flatMap(success => [
            [
                "CHAIN",
                `[${Helpers.short(success.user)}](https://defisim.xyz/?address=${success.user})`,
                success.fromChain.totalCollateralBase,
                success.fromChain.totalDebtBase,
                success.fromChain.currentLiquidationThreshold,
                success.fromChain.ltv,
                `**${success.fromChain.healthFactor}**`
            ],
            [
                "CALC",
                `[${Helpers.short(success.user)}](https://defisim.xyz/?address=${success.user})`,
                success.fromCalculation.totalCollateralBase,
                success.fromCalculation.totalDebtBase,
                success.fromCalculation.currentLiquidationThreshold,
                success.fromCalculation.ltv,
                `**${success.fromCalculation.healthFactor}**`
            ]
        ]);

        const entries: any = [
            {
                h1: `Report ${new Date().toLocaleString()}`,
            },
            {
                h2: "Rapport de Validation",
            },
            {
                text: "```mermaid\n%%{init: {'themeVariables': { 'pie1': '#10b981', 'pie2': '#f87171' }}}%%\npie title \"Validation Results\"\n    \"Successes\" : " + result.passed + "\n    \"Failures\" : " + result.failed + "\n```"
            },

            {
                table: {
                    columns: ["Total", "Succès", "Échecs", "Taux de succès", "Taux d'echec"],
                    rows: [
                        [total, result.passed, result.failed, successRate + '%', (100 - parseFloat(successRate)).toFixed(1) + '%']
                    ]
                },
            },

        ];

        if (successRows.length > 0) {
            entries.push(
                {
                    h3: "Success",
                },
                {
                    table: {
                        columns: ["From", "User", "Total Collateral", "Total Debt", "Liquidation Threshold", "LTV", "Health Factor"],
                        rows: successRows
                    }
                },
            );
        }

        if (failedRows.length > 0) {
            entries.push(
                {
                    h3: "Failed",
                },
                {
                    table: {
                        columns: ["From", "User", "Total Collateral", "Total Debt", "Liquidation Threshold", "LTV", "Health Factor"],
                        rows: failedRows
                    }
                },
            );
        }

        const filePath = path.join(__dirname, `../reports/report.md`);
        await fs.writeFile(filePath, tsMarkdown(entries));
    }
}