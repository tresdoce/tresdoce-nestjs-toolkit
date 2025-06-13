export declare const jestConfig: () => {
    moduleFileExtensions: string[];
    forceExit: boolean;
    verbose: boolean;
    rootDir: string;
    testRegex: string;
    transform: {
        '^.+\\.(t|j)s$': string;
    };
    roots: string[];
    collectCoverage: boolean;
    collectCoverageFrom: string[];
    coverageDirectory: string;
    coveragePathIgnorePatterns: string[];
    testEnvironment: string;
    setupFilesAfterEnv: string[];
    moduleDirectories: string[];
    preset: string;
    testResultsProcessor: string;
    displayName: string;
    coverageReporters: string[];
    reporters: (string | (string | {
        classNameTemplate: string;
        titleTemplate: string;
        ancestorSeparator: string;
        uniqueOutputName: string;
        suiteNameTemplate: string;
        includeConsoleOutput: boolean;
        addFileAttribute: string;
    })[])[];
    coverageThreshold: {
        global: {
            branches: number;
            functions: number;
            lines: number;
            statements: number;
        };
    };
};
