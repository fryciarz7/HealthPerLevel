import path from "node:path";
import { DependencyContainer } from "tsyringe";
import { VFS } from "@spt/utils/VFS";
import json5 from "json5";

export interface IHealthPerLevelConfig
{
    enabled: boolean,
    splitScavAndPmcHealth: boolean;
    keepBleedingChanceConsistant:boolean;
    increaseThresholdEveryIncrement: boolean;
    PMC: {
        levelsPerIncrement:number;
        healthSkillLevelsPerIncrement:number;
        healthPerHealthSkillLevel:boolean;
        baseHealth: { [key: string]: number };
        increasePerLevel: { [key: string]: number };
        increasePerHealthSkillLevel: { [key: string]: number };
    }
    SCAV: {
        levelsPerIncrement:number;
        healthSkillLevelsPerIncrement:number;
        healthPerHealthSkillLevel:boolean;
        baseHealth: { [key: string]: number };
        increasePerLevel: { [key: string]: number };
        increasePerHealthSkillLevel: { [key: string]: number };
    }
}

export class ConfigExports 
{
    private configJson: any;

    constructor(container: DependencyContainer)
    {
        const vfs = container.resolve<VFS>("VFS");
        this.configJson = json5.parse(vfs.readFile(path.resolve(__dirname, "../config/config.json5")));        
    }

    public getConfig(): IHealthPerLevelConfig
    {
        return this.mapConfig();
    }

    private mapConfig()
    {
        return { 
            enabled: this.configJson.enabled,
            splitScavAndPmcHealth: this.configJson.split_scav_and_PMC_health,
            keepBleedingChanceConsistant: this.configJson.keep_bleeding_chance_consistant,
            increaseThresholdEveryIncrement: this.configJson.increase_threshold_every_increment,
            PMC:
            {
                levelsPerIncrement: this.configJson.PMC.levels_per_increment,
                healthSkillLevelsPerIncrement: this.configJson.PMC.health_skill_levels_per_increment,
                healthPerHealthSkillLevel: this.configJson.PMC.health_per_health_skill_level,
                baseHealth:
                {
                    //Amount of base health per body part, based on the config.
                    Chest: this.configJson.PMC.base_health.thorax_base_health,
                    Stomach: this.configJson.PMC.base_health.stomach_base_health,
                    Head: this.configJson.PMC.base_health.head_base_health,
                    LeftArm: this.configJson.PMC.base_health.left_arm_base_health,
                    LeftLeg: this.configJson.PMC.base_health.left_leg_base_health,
                    RightArm: this.configJson.PMC.base_health.right_arm_base_health,
                    RightLeg: this.configJson.PMC.base_health.right_leg_base_health
                },
                increasePerLevel:
                {
                    //Amount of health that is added per level, broken down per body part from the config.
                    Chest: this.configJson.PMC.increase_per_level.thorax_health_per_level,
                    Stomach: this.configJson.PMC.increase_per_level.stomach_health_per_level,
                    Head: this.configJson.PMC.increase_per_level.head_health_per_level,
                    LeftArm: this.configJson.PMC.increase_per_level.left_arm_per_level,
                    LeftLeg: this.configJson.PMC.increase_per_level.left_leg_per_level,
                    RightArm: this.configJson.PMC.increase_per_level.right_arm_per_level,
                    RightLeg: this.configJson.PMC.increase_per_level.right_leg_per_level
                },
                increasePerHealthSkillLevel:
                {
                    //Amount of health that is added per Health Skill level, broken down per body part from the config.
                    Chest: this.configJson.PMC.increase_per_health_skill_level.health_skill_thorax_health_per_level,
                    Stomach: this.configJson.PMC.increase_per_health_skill_level.health_skill_stomach_health_per_level,
                    Head: this.configJson.PMC.increase_per_health_skill_level.health_skill_head_health_per_level,
                    LeftArm: this.configJson.PMC.increase_per_health_skill_level.health_skill_left_arm_per_level,
                    LeftLeg: this.configJson.PMC.increase_per_health_skill_level.health_skill_left_leg_per_level,
                    RightArm: this.configJson.PMC.increase_per_health_skill_level.health_skill_right_arm_per_level,
                    RightLeg: this.configJson.PMC.increase_per_health_skill_level.health_skill_right_leg_per_level
                }
            },
            SCAV:
            {
                levelsPerIncrement: this.configJson.SCAV.levels_per_increment,
                healthSkillLevelsPerIncrement: this.configJson.SCAV.health_skill_levels_per_increment,
                healthPerHealthSkillLevel: this.configJson.SCAV.health_per_health_skill_level,
                baseHealth:
                {
                    //Amount of base health per body part, based on the config.
                    Chest: this.configJson.SCAV.base_health.thorax_base_health,
                    Stomach: this.configJson.SCAV.base_health.stomach_base_health,
                    Head: this.configJson.SCAV.base_health.head_base_health,
                    LeftArm: this.configJson.SCAV.base_health.left_arm_base_health,
                    LeftLeg: this.configJson.SCAV.base_health.left_leg_base_health,
                    RightArm: this.configJson.SCAV.base_health.right_arm_base_health,
                    RightLeg: this.configJson.SCAV.base_health.right_leg_base_health
                },
                increasePerLevel:
                {
                    //Amount of health that is added per level, broken down per body part from the config.
                    Chest: this.configJson.SCAV.increase_per_level.thorax_health_per_level,
                    Stomach: this.configJson.SCAV.increase_per_level.stomach_health_per_level,
                    Head: this.configJson.SCAV.increase_per_level.head_health_per_level,
                    LeftArm: this.configJson.SCAV.increase_per_level.left_arm_per_level,
                    LeftLeg: this.configJson.SCAV.increase_per_level.left_leg_per_level,
                    RightArm: this.configJson.SCAV.increase_per_level.right_arm_per_level,
                    RightLeg: this.configJson.SCAV.increase_per_level.right_leg_per_level
                },
                increasePerHealthSkillLevel:
                {
                    //Amount of health that is added per Health Skill level, broken down per body part from the config.
                    Chest: this.configJson.SCAV.increase_per_health_skill_level.health_skill_thorax_health_per_level,
                    Stomach: this.configJson.SCAV.increase_per_health_skill_level.health_skill_stomach_health_per_level,
                    Head: this.configJson.SCAV.increase_per_health_skill_level.health_skill_head_health_per_level,
                    LeftArm: this.configJson.SCAV.increase_per_health_skill_level.health_skill_left_arm_per_level,
                    LeftLeg: this.configJson.SCAV.increase_per_health_skill_level.health_skill_left_leg_per_level,
                    RightArm: this.configJson.SCAV.increase_per_health_skill_level.health_skill_right_arm_per_level,
                    RightLeg: this.configJson.SCAV.increase_per_health_skill_level.health_skill_right_leg_per_level
                }
            }
        };
    }
}