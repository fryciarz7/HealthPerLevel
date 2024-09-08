import { DependencyContainer } from "@spt/models/external/tsyringe";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { IBodyPartsSettings } from "@spt/models/eft/common/IGlobals";
import { BodyPartsHealth } from "@spt/models/eft/common/tables/IBotBase";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { Common } from "@spt/models/eft/common/tables/IBotBase";
import { SkillTypes } from "@spt/models/enums/SkillTypes";
import { ILightBleeding } from "@spt/models/eft/common/IGlobals";
import { IHeavyBleeding } from "@spt/models/eft/common/IGlobals";
import { IFracture } from "@spt/models/eft/common/IGlobals";
import { ConfigExports } from "./ConfigExports";
import { IHealthPerLevelConfig } from "./ConfigExports";
//The number of skill points to reach level 1 is 10. Afterwards, it increases by 10 per level and is capped at 100 per skill level.

class HealthPerLevel implements IPreSptLoadMod, IPostDBLoadMod 
{
    private globalBodyParts: IBodyPartsSettings;
    private pmcBodyParts: BodyPartsHealth;
    private scavBodyParts: BodyPartsHealth;
    private pmcLevel: number;
    private scavLevel: number;
    private pmcHealthSkillLevel: Common;
    private scavHealthSkillLevel: Common;
    private logger: ILogger;
    private pmcProfile: IPmcData;
    private scavProfile: IPmcData;
    private healthElite: boolean;
    private lightBleeding: ILightBleeding; // Probabilit.Threshold = 35% of HP loss per body part
    private heavyBleeding: IHeavyBleeding; // Probabilit.Threshold = 50% of HP loss per body part
    private fracture: IFracture; // Probabilit.Threshold = 20% or 30% of HP loss per body part

    private cExports: IHealthPerLevelConfig;

    postDBLoad(container: DependencyContainer): void 
    {
        const dbServer = container
            .resolve<DatabaseServer>("DatabaseServer")
            .getTables().globals;
        this.globalBodyParts =
      dbServer.config.Health.ProfileHealthSettings.BodyPartsSettings;
        this.lightBleeding = dbServer.config.Health.Effects.LightBleeding;
        this.heavyBleeding = dbServer.config.Health.Effects.HeavyBleeding;
        this.fracture = dbServer.config.Health.Effects.Fracture;
    }

    preSptLoad(container: DependencyContainer): void 
    {
        const staticRMS = container.resolve<StaticRouterModService>(
            "StaticRouterModService"
        );
        const pHelp = container.resolve<ProfileHelper>("ProfileHelper");
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.logger.info("[HealthPerLevel] Loading HealthPerLevel...");
        const cHelper = new ConfigExports(container);
        this.cExports = cHelper.getConfig();
        this.logger.warning("[HealthPerLevel] this.cExports.config.splitScavAndPmcHealth " + this.cExports.splitScavAndPmcHealth);
        this.logger.warning("[HealthPerLevel] this.cExports.config.PMC.levelsPerIncrement " + this.cExports.PMC.levelsPerIncrement);
        
        staticRMS.registerStaticRouter(
            "HealthPerLevel",
            [
                {
                    url: "/client/game/start",
                    action: (url: any, info: any, sessionID: any, output: any) => 
                    {
                        try 
                        {
                            this.pmcBodyParts = pHelp.getPmcProfile(sessionID).Health.BodyParts;
                            this.pmcLevel = pHelp.getPmcProfile(sessionID).Info.Level;
                            this.pmcProfile = pHelp.getPmcProfile(sessionID);
                            this.pmcHealthSkillLevel = pHelp.getSkillFromProfile(this.pmcProfile, SkillTypes.HEALTH);
                            this.healthElite = this.isHealthElite();

                            this.scavBodyParts =
                pHelp.getScavProfile(sessionID).Health.BodyParts;
                            this.scavLevel = pHelp.getScavProfile(sessionID).Info.Level;
                            this.scavProfile = pHelp.getScavProfile(sessionID);
                            this.scavHealthSkillLevel = pHelp.getSkillFromProfile(this.scavProfile, SkillTypes.HEALTH);

                            this.calcPMCHealth(
                                this.pmcBodyParts,
                                this.pmcLevel,
                                this.cExports.PMC.baseHealth
                            );
                            if (this.isHealthPoolsSplit()) 
                            {
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.scavLevel,
                                    this.cExports.SCAV.baseHealth
                                );
                            }
                            else 
                            {
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.pmcLevel,
                                    this.cExports.PMC.baseHealth
                                );
                            }
                            if (this.cExports.keepBleedingChanceConsistant) 
                            {
                                this.calcLightBleedingThreshold(this.pmcBodyParts, this.pmcLevel);
                                this.calcHeavyBleedingThreshold(this.pmcBodyParts, this.pmcLevel);
                                this.calcFractureThreshold(this.pmcBodyParts, this.pmcLevel);
                            }
                        }
                        catch (error) 
                        {
                            this.logger.error("[HealthPerLevel] " + error.message);
                        }
                        return output;
                    }
                },
                {
                    url: "/client/items", //After load, gets player and scav level
                    action: (url: any, info: any, sessionID: any, output: any) => 
                    {
                        try 
                        {
                            this.pmcBodyParts =
                pHelp.getPmcProfile(sessionID).Health.BodyParts;
                            this.pmcLevel = pHelp.getPmcProfile(sessionID).Info.Level;

                            this.scavBodyParts =
                pHelp.getScavProfile(sessionID).Health.BodyParts;
                            this.scavLevel = pHelp.getScavProfile(sessionID).Info.Level;

                            this.calcPMCHealth(
                                this.pmcBodyParts,
                                this.pmcLevel,
                                this.cExports.PMC.baseHealth
                            );
                            if (this.isHealthPoolsSplit()) 
                            {
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.scavLevel,
                                    this.cExports.SCAV.baseHealth
              
                                ); 
                            }
                            else 
                            { //If split health is FALSE use this
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.pmcLevel,
                                    this.cExports.PMC.baseHealth
                
                                );
                            }
                            if (this.cExports.keepBleedingChanceConsistant) 
                            {
                                this.calcLightBleedingThreshold(this.pmcBodyParts, this.pmcLevel);
                                this.calcHeavyBleedingThreshold(this.pmcBodyParts, this.pmcLevel);
                                this.calcFractureThreshold(this.pmcBodyParts, this.pmcLevel);
                            }
                        }
                        catch (error) 
                        {
                            this.logger.error("[HealthPerLevel] " + error.message);
                        }
                        return output;
                    }
                }
            ],
            "aki"
        );
    }

    private calcPMCHealth(
        bodyPart: BodyPartsHealth,
        accountLevel: number,
        preset
    ) 
    {
        for (const key in this.cExports.PMC.increasePerLevel) 
        {
            bodyPart[key].Health.Maximum =
            preset[key] + (this.getPmcIncrement(accountLevel)) * this.cExports.PMC.increasePerLevel[key];
            if (this.cExports.PMC.healthPerHealthSkillLevel == true && this.pmcHealthSkillLevel)
            {
                bodyPart[key].Health.Maximum += Math.floor(this.pmcHealthSkillLevel.Progress / 100 / this.cExports.PMC.healthSkillLevelsPerIncrement) * this.cExports.PMC.increasePerHealthSkillLevel[key];
            }
            if (bodyPart[key].Health.Current > bodyPart[key].Health.Maximum)
            {
                this.logger.warning("[HealthPerLevel] How is your health higher than maximum, again? I mean your " + key + " is something else.");
                bodyPart[key].Health.Current = bodyPart[key].Health.Maximum;
            }
        }
    }

    private calcSCAVHealth(
        bodyPart: BodyPartsHealth,
        accountLevel: number,
        preset
    ) 
    {
        if (this.isHealthPoolsSplit()) 
        { //If the config is setup to split scav and PMC health values then it uses the _SCAV config number, otherwise uses the _PMC number
            for (const key in this.cExports.SCAV.increasePerLevel) 
            {
                bodyPart[key].Health.Maximum =
            preset[key] + (this.getScavIncrement(accountLevel)) * this.cExports.SCAV.increasePerLevel[key];
                if (this.cExports.SCAV.healthPerHealthSkillLevel == true)
                {
                    bodyPart[key].Health.Maximum += Math.floor(this.scavHealthSkillLevel.Progress / 100 / this.cExports.SCAV.healthSkillLevelsPerIncrement) * this.cExports.SCAV.increasePerHealthSkillLevel[key];
                }
                bodyPart[key].Health.Current = bodyPart[key].Health.Maximum;
            }
        }
        else 
        {
            for (const key in this.cExports.PMC.increasePerLevel) 
            {
                bodyPart[key].Health.Maximum =
            preset[key] + (this.getPmcIncrement(accountLevel)) * this.cExports.PMC.increasePerLevel[key];
                if (this.cExports.PMC.healthPerHealthSkillLevel == true)
                {
                    bodyPart[key].Health.Maximum += Math.floor(this.pmcHealthSkillLevel.Progress / 100 / this.cExports.PMC.healthSkillLevelsPerIncrement) * this.cExports.PMC.increasePerHealthSkillLevel[key];
                }
                bodyPart[key].Health.Current = bodyPart[key].Health.Maximum;
            }
        }
    }

    private calcLightBleedingThreshold(bodyPart: BodyPartsHealth, accountLevel: number) 
    {
        this.logger.warning("[HealthPerLevel] Calculating Light Bleeding Threshold...");
        const baseThresholdValue: number = this.cExports.increaseThresholdEveryIncrement ? 21 + this.getPmcIncrement(accountLevel) : 21;
        const bleedingThreshold: string = (baseThresholdValue / bodyPart.LeftArm.Health.Maximum).toFixed(3);
        this.lightBleeding.Probability.Threshold = Number.parseFloat(bleedingThreshold);
    }

    private calcHeavyBleedingThreshold(bodyPart: BodyPartsHealth, accountLevel: number) 
    {
        this.logger.warning("[HealthPerLevel] Calculating Heavy Bleeding Threshold...");
        const baseThresholdValue: number = this.cExports.increaseThresholdEveryIncrement ? 30 + this.getPmcIncrement(accountLevel) : 30;
        const bleedingThreshold: string = (baseThresholdValue / bodyPart.LeftArm.Health.Maximum).toFixed(3);
        this.heavyBleeding.Probability.Threshold = Number.parseFloat(bleedingThreshold);
    }

    private calcFractureThreshold(bodyPart: BodyPartsHealth, accountLevel: number) 
    {
        this.logger.warning("[HealthPerLevel] Calculating Fractures Threshold...");
        const baseFallingThresholdValue: number = this.cExports.increaseThresholdEveryIncrement ? 12 + this.getPmcIncrement(accountLevel) : 12;
        const baseBulletThresholdValue: number = this.cExports.increaseThresholdEveryIncrement ? 18 + this.getPmcIncrement(accountLevel) : 18;
        const fallingFractureThreshold: string = (baseFallingThresholdValue / bodyPart.LeftArm.Health.Maximum).toFixed(3);
        const bulletFractureThreshold: string = (baseBulletThresholdValue / bodyPart.LeftArm.Health.Maximum).toFixed(3);
        this.fracture.FallingProbability.Threshold = Number.parseFloat(fallingFractureThreshold);
        this.fracture.BulletHitProbability.Threshold = Number.parseFloat(bulletFractureThreshold);
    }

    //private isHealthElite(skillType: SkillTypes, pmcProfile: IPmcData): boolean //Supposed to check if health is 'elite' but doesn't work yet
    private isHealthElite(): boolean //Supposed to check if health is 'elite' but doesn't work yet
    {
        this.logger.warning("[HealthPerLevel] Health skill level: " + this.pmcHealthSkillLevel.Progress);
        if (this.pmcHealthSkillLevel.Progress < 5100)
        {
            this.logger.warning("[HealthPerLevel] " + "Health found, but not elite");
            return false;
        }
        else 
            this.logger.warning("[HealthPerLevel] " + "Health is elite");
        return this.pmcHealthSkillLevel.Progress >= 5100; // level 51
    }

    private changeBotHealth  () : void
    {
        //  /client/game/bot/generate
        //This area does nothing currently but eventually bots will also increase per their level.

    }

    private isHealthPoolsSplit() 
    {
        return this.cExports.splitScavAndPmcHealth == true;
    }

    private getPmcIncrement(accountLevel: number) 
    {
        return Math.trunc((accountLevel - 1) / this.cExports.PMC.levelsPerIncrement);
    }

    private getScavIncrement(accountLevel: number) 
    {
        return Math.trunc((accountLevel - 1) / this.cExports.SCAV.levelsPerIncrement);
    }
}

module.exports = { mod: new HealthPerLevel() };
