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
    public healthPerHealthSkillLevelPmc:boolean;
    public healthPerHealthSkillLevelScav:boolean;
    public levelsPerIncrementPmc:number;
    public healthSkillLevelsPerIncrementPmc:number;
    public levelsPerIncrementScav:number;
    public healthSkillLevelsPerIncrementScav:number;

    public increasePerLevelPMC: { [key: string]: number } = {};
    public increasePerHealthSkillLevelPMC: { [key: string]: number } = {}  
    public increasePerLevelSCAV: { [key: string]: number } = {};  
    public increasePerHealthSkillLevelSCAV: { [key: string]: number } = {};    
    public baseHealthPMC: { [key: string]: number } = {};
    public baseHealthSCAV: { [key: string]: number } = {};

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
        this.levelsPerIncrementPmc = this.config.levels_per_increment_PMC;
        this.healthPerHealthSkillLevelPmc = this.config.health_per_health_skill_level_pmc;
        this.healthSkillLevelsPerIncrementPmc = this.config.health_skill_levels_per_increment_PMC;
        this.levelsPerIncrementScav = this.config.levels_per_increment_SCAV;
        this.healthPerHealthSkillLevelScav = this.config.health_per_health_skill_level_scav;
        this.healthSkillLevelsPerIncrementScav = this.config.health_skill_levels_per_increment_SCAV;
        this.increasePerLevelPMC = {
            //Amount of health that is added per level, broken down per body part from the config.
            Chest: this.config.thorax_health_per_level_PMC,
            Stomach: this.config.stomach_health_per_level_PMC,
            Head: this.config.head_health_per_level_PMC,
            LeftArm: this.config.left_arm_per_level_PMC,
            LeftLeg: this.config.left_leg_per_level_PMC,
            RightArm: this.config.right_arm_per_level_PMC,
            RightLeg: this.config.right_leg_per_level_PMC
        };
    
        this.increasePerHealthSkillLevelPMC = {
            //Amount of health that is added per Health Skill level, broken down per body part from the config.
            Chest: this.config.health_skill_thorax_health_per_level_PMC,
            Stomach: this.config.health_skill_stomach_health_per_level_PMC,
            Head: this.config.health_skill_head_health_per_level_PMC,
            LeftArm: this.config.health_skill_left_arm_per_level_PMC,
            LeftLeg: this.config.health_skill_left_leg_per_level_PMC,
            RightArm: this.config.health_skill_right_arm_per_level_PMC,
            RightLeg: this.config.health_skill_right_leg_per_level_PMC
        };
      
        this.increasePerLevelSCAV = {
            //Amount of health that is added per level, broken down per body part from the config.
            Chest: this.config.thorax_health_per_level_SCAV,
            Stomach: this.config.stomach_health_per_level_SCAV,
            Head: this.config.head_health_per_level_SCAV,
            LeftArm: this.config.left_arm_per_level_SCAV,
            LeftLeg: this.config.left_leg_per_level_SCAV,
            RightArm: this.config.right_arm_per_level_SCAV,
            RightLeg: this.config.right_leg_per_level_SCAV
        };
      
        this.increasePerHealthSkillLevelSCAV = {
            //Amount of health that is added per Health Skill level, broken down per body part from the config.
            Chest: this.config.health_skill_thorax_health_per_level_SCAV,
            Stomach: this.config.health_skill_stomach_health_per_level_SCAV,
            Head: this.config.health_skill_head_health_per_level_SCAV,
            LeftArm: this.config.health_skill_left_arm_per_level_SCAV,
            LeftLeg: this.config.health_skill_left_leg_per_level_SCAV,
            RightArm: this.config.health_skill_right_arm_per_level_SCAV,
            RightLeg: this.config.health_skill_right_leg_per_level_SCAV
        };
        
        this.baseHealthPMC = {
            //Amount of base health per body part, based on the config.
            Chest: this.config.thorax_base_health_PMC,
            Stomach: this.config.stomach_base_health_PMC,
            Head: this.config.head_base_health_PMC,
            LeftArm: this.config.left_arm_base_health_PMC,
            LeftLeg: this.config.left_leg_base_health_PMC,
            RightArm: this.config.right_arm_base_health_PMC,
            RightLeg: this.config.right_leg_base_health_PMC
        };
    
        this.baseHealthSCAV = {
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
}