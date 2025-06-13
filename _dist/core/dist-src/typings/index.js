export var EAppStage;
(function (EAppStage) {
    EAppStage["local"] = "local";
    EAppStage["test"] = "test";
    EAppStage["snd"] = "snd";
    EAppStage["dev"] = "dev";
    EAppStage["qa"] = "qa";
    EAppStage["homo"] = "homo";
    EAppStage["prod"] = "prod";
})(EAppStage || (EAppStage = {}));
export var ESkipHealthChecks;
(function (ESkipHealthChecks) {
    ESkipHealthChecks["storage"] = "storage";
    ESkipHealthChecks["memory"] = "memory";
    ESkipHealthChecks["elasticsearch"] = "elasticsearch";
    ESkipHealthChecks["camunda"] = "camunda";
    ESkipHealthChecks["typeorm"] = "typeorm";
    ESkipHealthChecks["redis"] = "redis";
})(ESkipHealthChecks || (ESkipHealthChecks = {}));
