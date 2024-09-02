import { DependencyContainer } from "@spt-aki/models/external/tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { BodyPartsSettings } from "@spt-aki/models/eft/common/IGlobals";
import { BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { SkillTypes } from "@spt-aki/models/enums/SkillTypes";
//import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";
//The number of skill points to reach level 1 is 10. Afterwards, it increases by 10 per level and is capped at 100 per skill level.

class HealthPerLevel implements IPreAkiLoadMod, IPostDBLoadMod 
{
  private config = require("../config/config.json")
  private GlobalBodyParts: BodyPartsSettings;
  private PMCBodyParts: BodyPartsHealth;
  private SCAVBodyParts: BodyPartsHealth;
  private PMCLevel: number;
  private SCAVLevel: number;
  private PMCSKillLevel: SkillTypes;
  private logger: ILogger;
  




  postDBLoad(container: DependencyContainer): void {
    const dbServer = container
      .resolve<DatabaseServer>("DatabaseServer")
      .getTables().globals;
    this.GlobalBodyParts =
      dbServer.config.Health.ProfileHealthSettings.BodyPartsSettings;
  }

  preSptLoad(
    container: DependencyContainer,
    pmcProfile: IPmcData
    ): void {
    

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
          action: (url: any, info: any, sessionID: any, output: any) => {
            try {
              this.PMCBodyParts =
                pHelp.getPmcProfile(sessionID).Health.BodyParts;
              this.PMCLevel = pHelp.getPmcProfile(sessionID).Info.Level;
              //this.PMCSKillLevel = pHelp.getPMCHealthSkill(sessionID).Info.skill.Progress;
              //this.isHealthElite = healthElite;
              //this.logger.warning(healthElite);
              

              this.SCAVBodyParts =
                pHelp.getScavProfile(sessionID).Health.BodyParts;
              this.SCAVLevel = pHelp.getScavProfile(sessionID).Info.Level;

              this.calcPMCHealth(
                this.PMCBodyParts,
                this.PMCLevel,
                this.BaseHealth_PMC
              );
              if (this.config.split_scav_and_PMC_health = "True") {
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVLevel,
                this.BaseHealth_SCAV
              );
              }
              else {
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVLevel,
                this.BaseHealth_PMC
              );
              }
            } catch (error) {
              this.logger.error(error.message);
            }
            return output;
          },
        },
        {
          url: "/client/items", //After load, gets player and scav level
          action: (url: any, info: any, sessionID: any, output: any) => {
            try {
              this.PMCBodyParts =
                pHelp.getPmcProfile(sessionID).Health.BodyParts;
              this.PMCLevel = pHelp.getPmcProfile(sessionID).Info.Level;

              this.SCAVBodyParts =
                pHelp.getScavProfile(sessionID).Health.BodyParts;
              this.SCAVLevel = pHelp.getScavProfile(sessionID).Info.Level;

              this.calcPMCHealth(
                this.PMCBodyParts,
                this.PMCLevel,
                this.BaseHealth_PMC
              );
              if (this.config.split_scav_and_PMC_health = "True") {
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVLevel,
                this.BaseHealth_SCAV
              
              ); 
              }
              else { //If split health is FALSE use this
                this.calcSCAVHealth(
                  this.SCAVBodyParts,
                  this.SCAVLevel,
                  this.BaseHealth_PMC
                
                );
              }
            } catch (error) {
              this.logger.error(error.message);
            }
            return output;
          },
        },
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
    for (let key in this.IncreasePerLevel_PMC) {
      bodyPart[key].Health.Maximum =
        preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_PMC)) * this.IncreasePerLevel_PMC[key];
    }
  }

  private calcSCAVHealth(
    bodyPart: BodyPartsHealth,
    accountLevel: number,
    preset
    ) 
    {
      if (this.config.split_scav_and_PMC_health = "True") { //If the config is setup to split scav and PMC health values then it uses the _SCAV config number, otherwise uses the _PMC number
        for (let key in this.IncreasePerLevel_SCAV) {
          bodyPart[key].Health.Maximum =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_SCAV)) * this.IncreasePerLevel_SCAV[key];
        }
        for (let key in this.IncreasePerLevel_SCAV) {
          bodyPart[key].Health.Current =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_SCAV)) * this.IncreasePerLevel_SCAV[key];
        } 
      }
      else {
        for (let key in this.IncreasePerLevel_PMC) {
          bodyPart[key].Health.Maximum =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_PMC)) * this.IncreasePerLevel_PMC[key];
        }
        for (let key in this.IncreasePerLevel_PMC) {
          bodyPart[key].Health.Current =
            preset[key] + (Math.trunc((accountLevel - 1)/this.config.levels_per_increment_PMC)) * this.IncreasePerLevel_PMC[key];
        } 
      }
  }

  private isHealthElite(skillType: SkillTypes, pmcProfile: IPmcData): boolean //Supposed to check if health is 'elite' but doesn't work yet
    {
        const getHealthSkill = this.PMCSKillLevel;

        if (!skillType)
        {
            return false;
        }

        const profileSkill = this.PMCSKillLevel.find((x) => x.Id === skillType);
        if (!getHealthSkill)
        {
            this.logger.warning(`Unable to check for elite skill ${skillType}, not found in profile`);

            return false;
        }
        else if (getHealthSkill < 5100)
        {
            this.logger.warning(`Health found, but not elite`);

            return false;
        }
        else 
        this.logger.warning(`Health is elite`);
        return this.PMCSKillLevel.Progress >= 5100; // level 51
    }

    private changeBotHealth  () : void
    {
      //  /client/game/bot/generate
      //This area does nothing currently but eventually bots will also increase per their level.

    }
    private IncreasePerLevel_PMC: { [key: string]: number } = {
      //Amount of health that is added per level, broken down per body part from the config.
      Chest: this.config.thorax_health_per_level_PMC,
      Stomach: this.config.stomach_health_per_level_PMC,
      Head: this.config.head_health_per_level_PMC,
      LeftArm: this.config.left_arm_per_level_PMC,
      LeftLeg: this.config.left_leg_per_level_PMC,
      RightArm: this.config.right_arm_per_level_PMC,
      RightLeg: this.config.right_leg_per_level_PMC,
      
    };
  
    private IncreasePerLevel_SCAV: { [key: string]: number } = {
      //Amount of health that is added per level, broken down per body part from the config.
      Chest: this.config.thorax_health_per_level_SCAV,
      Stomach: this.config.stomach_health_per_level_SCAV,
      Head: this.config.head_health_per_level_SCAV,
      LeftArm: this.config.left_arm_per_level_SCAV,
      LeftLeg: this.config.left_leg_per_level_SCAV,
      RightArm: this.config.right_arm_per_level_SCAV,
      RightLeg: this.config.right_leg_per_level_SCAV,
      
    };
    
    private BaseHealth_PMC: { [key: string]: number } = {
      //Amount of base health per body part, based on the config.
      Chest: this.config.thorax_base_health_PMC,
      Stomach: this.config.stomach_base_health_PMC,
      Head: this.config.head_base_health_PMC,
      LeftArm: this.config.left_arm_base_health_PMC,
      LeftLeg: this.config.left_leg_base_health_PMC,
      RightArm: this.config.right_arm_base_health_PMC,
      RightLeg: this.config.right_leg_base_health_PMC,
      
    };

    private BaseHealth_SCAV: { [key: string]: number } = {
      //Amount of base health per body part, based on the config.
      Chest: this.config.thorax_base_health_SCAV,
      Stomach: this.config.stomach_base_health_SCAV,
      Head: this.config.head_base_health_SCAV,
      LeftArm: this.config.left_arm_base_health_SCAV,
      LeftLeg: this.config.left_leg_base_health_SCAV,
      RightArm: this.config.right_arm_base_health_SCAV,
      RightLeg: this.config.right_leg_base_health_SCAV,
      
    };
}

module.exports = { mod: new HealthPerLevel() };
