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
//The number of skill points to reach level 1 is 10. Afterwards, it increases by 10 per level and is capped at 100 per skill level.

class HealthPerLevel implements IPreSptLoadMod, IPostDBLoadMod 
{
    private config = require("../config/config.json")
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

    postDBLoad(container: DependencyContainer): void 
    {
        const dbServer = container
            .resolve<DatabaseServer>("DatabaseServer")
            .getTables().globals;
        this.globalBodyParts =
      dbServer.config.Health.ProfileHealthSettings.BodyPartsSettings;
    }

    preSptLoad(container: DependencyContainer): void 
    {
        const staticRMS = container.resolve<StaticRouterModService>(
            "StaticRouterModService"
        );
        const pHelp = container.resolve<ProfileHelper>("ProfileHelper");
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.logger.info("[HealthPerLevel] Loading HealthPerLevel...")
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
                                this.baseHealthPMC
                            );
                            if (this.config.split_scav_and_PMC_health == true) 
                            {
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.scavLevel,
                                    this.baseHealthSCAV
                                );
                            }
                            else 
                            {
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.pmcLevel,
                                    this.baseHealthPMC
                                );
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
                                this.baseHealthPMC
                            );
                            if (this.config.split_scav_and_PMC_health == true) 
                            {
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.scavLevel,
                                    this.baseHealthSCAV
              
                                ); 
                            }
                            else 
                            { //If split health is FALSE use this
                                this.calcSCAVHealth(
                                    this.scavBodyParts,
                                    this.pmcLevel,
                                    this.baseHealthPMC
                
                                );
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
        for (const key in this.increasePerLevelPMC) 
        {
            bodyPart[key].Health.Maximum =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_PMC)) * this.increasePerLevelPMC[key];
            if (this.config.health_per_health_skill_level_pmc == true && this.pmcHealthSkillLevel)
            {
                bodyPart[key].Health.Maximum += Math.floor(this.pmcHealthSkillLevel.Progress / 100 / this.config.health_skill_levels_per_increment_PMC) * this.increasePerHealthSkillLevelPMC[key];
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
        if (this.config.split_scav_and_PMC_health == true) 
        { //If the config is setup to split scav and PMC health values then it uses the _SCAV config number, otherwise uses the _PMC number
            for (const key in this.increasePerLevelSCAV) 
            {
                bodyPart[key].Health.Maximum =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_SCAV)) * this.increasePerLevelSCAV[key];
                if (this.config.health_per_health_skill_level_scav == true)
                {
                    bodyPart[key].Health.Maximum += Math.floor(this.scavHealthSkillLevel.Progress / 100 / this.config.health_skill_levels_per_increment_SCAV) * this.increasePerHealthSkillLevelSCAV[key];
                }
                bodyPart[key].Health.Current = bodyPart[key].Health.Maximum;
            }
        }
        else 
        {
            for (const key in this.increasePerLevelPMC) 
            {
                bodyPart[key].Health.Maximum =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_PMC)) * this.increasePerLevelPMC[key];
                if (this.config.health_per_health_skill_level_pmc == true)
                {
                    bodyPart[key].Health.Maximum += Math.floor(this.pmcHealthSkillLevel.Progress / 100 / this.config.health_skill_levels_per_increment_PMC) * this.increasePerHealthSkillLevelPMC[key];
                }
                bodyPart[key].Health.Current = bodyPart[key].Health.Maximum;
            }
        }
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
    private increasePerLevelPMC: { [key: string]: number } = {
        //Amount of health that is added per level, broken down per body part from the config.
        Chest: this.config.thorax_health_per_level_PMC,
        Stomach: this.config.stomach_health_per_level_PMC,
        Head: this.config.head_health_per_level_PMC,
        LeftArm: this.config.left_arm_per_level_PMC,
        LeftLeg: this.config.left_leg_per_level_PMC,
        RightArm: this.config.right_arm_per_level_PMC,
        RightLeg: this.config.right_leg_per_level_PMC
    };

    private increasePerHealthSkillLevelPMC: { [key: string]: number } = {
        //Amount of health that is added per Health Skill level, broken down per body part from the config.
        Chest: this.config.health_skill_thorax_health_per_level_PMC,
        Stomach: this.config.health_skill_stomach_health_per_level_PMC,
        Head: this.config.health_skill_head_health_per_level_PMC,
        LeftArm: this.config.health_skill_left_arm_per_level_PMC,
        LeftLeg: this.config.health_skill_left_leg_per_level_PMC,
        RightArm: this.config.health_skill_right_arm_per_level_PMC,
        RightLeg: this.config.health_skill_right_leg_per_level_PMC
    }
  
    private increasePerLevelSCAV: { [key: string]: number } = {
        //Amount of health that is added per level, broken down per body part from the config.
        Chest: this.config.thorax_health_per_level_SCAV,
        Stomach: this.config.stomach_health_per_level_SCAV,
        Head: this.config.head_health_per_level_SCAV,
        LeftArm: this.config.left_arm_per_level_SCAV,
        LeftLeg: this.config.left_leg_per_level_SCAV,
        RightArm: this.config.right_arm_per_level_SCAV,
        RightLeg: this.config.right_leg_per_level_SCAV
    };
  
    private increasePerHealthSkillLevelSCAV: { [key: string]: number } = {
        //Amount of health that is added per Health Skill level, broken down per body part from the config.
        Chest: this.config.health_skill_thorax_health_per_level_SCAV,
        Stomach: this.config.health_skill_stomach_health_per_level_SCAV,
        Head: this.config.health_skill_head_health_per_level_SCAV,
        LeftArm: this.config.health_skill_left_arm_per_level_SCAV,
        LeftLeg: this.config.health_skill_left_leg_per_level_SCAV,
        RightArm: this.config.health_skill_right_arm_per_level_SCAV,
        RightLeg: this.config.health_skill_right_leg_per_level_SCAV
    };
    
    private baseHealthPMC: { [key: string]: number } = {
        //Amount of base health per body part, based on the config.
        Chest: this.config.thorax_base_health_PMC,
        Stomach: this.config.stomach_base_health_PMC,
        Head: this.config.head_base_health_PMC,
        LeftArm: this.config.left_arm_base_health_PMC,
        LeftLeg: this.config.left_leg_base_health_PMC,
        RightArm: this.config.right_arm_base_health_PMC,
        RightLeg: this.config.right_leg_base_health_PMC
    };

    private baseHealthSCAV: { [key: string]: number } = {
        //Amount of base health per body part, based on the config.
        Chest: this.config.thorax_base_health_SCAV,
        Stomach: this.config.stomach_base_health_SCAV,
        Head: this.config.head_base_health_SCAV,
        LeftArm: this.config.left_arm_base_health_SCAV,
        LeftLeg: this.config.left_leg_base_health_SCAV,
        RightArm: this.config.right_arm_base_health_SCAV,
        RightLeg: this.config.right_leg_base_health_SCAV
    };
}

module.exports = { mod: new HealthPerLevel() };
