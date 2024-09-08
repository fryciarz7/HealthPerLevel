import path from "node:path";
import { DependencyContainer } from "tsyringe";
import { VFS } from "@spt/utils/VFS";
import json5 from "json5";

export class ConfigExports 
{
    private config: any;

    public splitScavAndPmcHealth: boolean;
    public keepBleedingChanceConsistant:boolean;
    public increaseThresholdEveryIncrement: boolean;
    
    public levelsPerIncrementPmc:number;
    public healthSkillLevelsPerIncrementPmc:number;
    public healthPerHealthSkillLevelPmc:boolean;
    public baseHealthPMC: { [key: string]: number } = {};
    public increasePerLevelPMC: { [key: string]: number } = {};
    public increasePerHealthSkillLevelPMC: { [key: string]: number } = {};
    
    public levelsPerIncrementScav:number;
    public healthSkillLevelsPerIncrementScav:number;
    public healthPerHealthSkillLevelScav:boolean;
    public baseHealthSCAV: { [key: string]: number } = {};
    public increasePerLevelSCAV: { [key: string]: number } = {};  
    public increasePerHealthSkillLevelSCAV: { [key: string]: number } = {};    

    constructor(container: DependencyContainer)
    {
        const vfs = container.resolve<VFS>("VFS");
        this.config = json5.parse(vfs.readFile(path.resolve(__dirname, "../config/config.json5")));        
        this.mapConfig();
    }

    private mapConfig()
    {
        this.splitScavAndPmcHealth = this.config.split_scav_and_PMC_health;

        this.keepBleedingChanceConsistant = this.config.keep_bleeding_chance_consistant;
        this.increaseThresholdEveryIncrement = this.config.increase_threshold_every_increment;
        
        this.levelsPerIncrementPmc = this.config.PMC.levels_per_increment;
        this.healthSkillLevelsPerIncrementPmc = this.config.PMC.health_skill_levels_per_increment;

        this.healthPerHealthSkillLevelPmc = this.config.PMC.health_per_health_skill_level;

        this.levelsPerIncrementScav = this.config.SCAV.levels_per_increment;
        this.healthSkillLevelsPerIncrementScav = this.config.SCAV.health_skill_levels_per_increment;
        
        this.healthPerHealthSkillLevelScav = this.config.SCAV.health_per_health_skill_level;

        this.increasePerLevelPMC = {
            //Amount of health that is added per level, broken down per body part from the config.
            Chest: this.config.PMC.increase_per_level.thorax_health_per_level,
            Stomach: this.config.PMC.increase_per_level.stomach_health_per_level,
            Head: this.config.PMC.increase_per_level.head_health_per_level,
            LeftArm: this.config.PMC.increase_per_level.left_arm_per_level,
            LeftLeg: this.config.PMC.increase_per_level.left_leg_per_level,
            RightArm: this.config.PMC.increase_per_level.right_arm_per_level,
            RightLeg: this.config.PMC.increase_per_level.right_leg_per_level
        };
    
        this.increasePerHealthSkillLevelPMC = {
            //Amount of health that is added per Health Skill level, broken down per body part from the config.
            Chest: this.config.PMC.increase_per_health_skill_level.health_skill_thorax_health_per_level,
            Stomach: this.config.PMC.increase_per_health_skill_level.health_skill_stomach_health_per_level,
            Head: this.config.PMC.increase_per_health_skill_level.health_skill_head_health_per_level,
            LeftArm: this.config.PMC.increase_per_health_skill_level.health_skill_left_arm_per_level,
            LeftLeg: this.config.PMC.increase_per_health_skill_level.health_skill_left_leg_per_level,
            RightArm: this.config.PMC.increase_per_health_skill_level.health_skill_right_arm_per_level,
            RightLeg: this.config.PMC.increase_per_health_skill_level.health_skill_right_leg_per_level
        };
      
        this.increasePerLevelSCAV = {
            //Amount of health that is added per level, broken down per body part from the config.
            Chest: this.config.SCAV.increase_per_level.thorax_health_per_level,
            Stomach: this.config.SCAV.increase_per_level.stomach_health_per_level,
            Head: this.config.SCAV.increase_per_level.head_health_per_level,
            LeftArm: this.config.SCAV.increase_per_level.left_arm_per_level,
            LeftLeg: this.config.SCAV.increase_per_level.left_leg_per_level,
            RightArm: this.config.SCAV.increase_per_level.right_arm_per_level,
            RightLeg: this.config.SCAV.increase_per_level.right_leg_per_level
        };
      
        this.increasePerHealthSkillLevelSCAV = {
            //Amount of health that is added per Health Skill level, broken down per body part from the config.
            Chest: this.config.SCAV.increase_per_health_skill_level.health_skill_thorax_health_per_level,
            Stomach: this.config.SCAV.increase_per_health_skill_level.health_skill_stomach_health_per_level,
            Head: this.config.SCAV.increase_per_health_skill_level.health_skill_head_health_per_level,
            LeftArm: this.config.SCAV.increase_per_health_skill_level.health_skill_left_arm_per_level,
            LeftLeg: this.config.SCAV.increase_per_health_skill_level.health_skill_left_leg_per_level,
            RightArm: this.config.SCAV.increase_per_health_skill_level.health_skill_right_arm_per_level,
            RightLeg: this.config.SCAV.increase_per_health_skill_level.health_skill_right_leg_per_level
        };
        
        this.baseHealthPMC = {
            //Amount of base health per body part, based on the config.
            Chest: this.config.PMC.base_health.thorax_base_health,
            Stomach: this.config.PMC.base_health.stomach_base_health,
            Head: this.config.PMC.base_health.head_base_health,
            LeftArm: this.config.PMC.base_health.left_arm_base_health,
            LeftLeg: this.config.PMC.base_health.left_leg_base_health,
            RightArm: this.config.PMC.base_health.right_arm_base_health,
            RightLeg: this.config.PMC.base_health.right_leg_base_health
        };
    
        this.baseHealthSCAV = {
            //Amount of base health per body part, based on the config.
            Chest: this.config.SCAV.base_health.thorax_base_health,
            Stomach: this.config.SCAV.base_health.stomach_base_health,
            Head: this.config.SCAV.base_health.head_base_health,
            LeftArm: this.config.SCAV.base_health.left_arm_base_health,
            LeftLeg: this.config.SCAV.base_health.left_leg_base_health,
            RightArm: this.config.SCAV.base_health.right_arm_base_health,
            RightLeg: this.config.SCAV.base_health.right_leg_base_health
        };
    }
}