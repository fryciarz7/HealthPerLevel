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
        this.healthSkillLevelsPerIncrementPmc = this.config.health_skill_levels_per_increment_PMC;

        this.healthPerHealthSkillLevelPmc = this.config.health_per_health_skill_level_pmc;

        this.levelsPerIncrementScav = this.config.levels_per_increment_SCAV;
        this.healthSkillLevelsPerIncrementScav = this.config.health_skill_levels_per_increment_SCAV;
        
        this.healthPerHealthSkillLevelScav = this.config.health_per_health_skill_level_scav;

        this.increasePerLevelPMC = {
            //Amount of health that is added per level, broken down per body part from the config.
            Chest: this.config.increase_per_level_PMC.thorax_health_per_level_PMC,
            Stomach: this.config.increase_per_level_PMC.stomach_health_per_level_PMC,
            Head: this.config.increase_per_level_PMC.head_health_per_level_PMC,
            LeftArm: this.config.increase_per_level_PMC.left_arm_per_level_PMC,
            LeftLeg: this.config.increase_per_level_PMC.left_leg_per_level_PMC,
            RightArm: this.config.increase_per_level_PMC.right_arm_per_level_PMC,
            RightLeg: this.config.increase_per_level_PMC.right_leg_per_level_PMC
        };
    
        this.increasePerHealthSkillLevelPMC = {
            //Amount of health that is added per Health Skill level, broken down per body part from the config.
            Chest: this.config.increase_per_health_skill_level_PMC.health_skill_thorax_health_per_level_PMC,
            Stomach: this.config.increase_per_health_skill_level_PMC.health_skill_stomach_health_per_level_PMC,
            Head: this.config.increase_per_health_skill_level_PMC.health_skill_head_health_per_level_PMC,
            LeftArm: this.config.increase_per_health_skill_level_PMC.health_skill_left_arm_per_level_PMC,
            LeftLeg: this.config.increase_per_health_skill_level_PMC.health_skill_left_leg_per_level_PMC,
            RightArm: this.config.increase_per_health_skill_level_PMC.health_skill_right_arm_per_level_PMC,
            RightLeg: this.config.increase_per_health_skill_level_PMC.health_skill_right_leg_per_level_PMC
        };
      
        this.increasePerLevelSCAV = {
            //Amount of health that is added per level, broken down per body part from the config.
            Chest: this.config.increase_per_level_SCAV.thorax_health_per_level_SCAV,
            Stomach: this.config.increase_per_level_SCAV.stomach_health_per_level_SCAV,
            Head: this.config.increase_per_level_SCAV.head_health_per_level_SCAV,
            LeftArm: this.config.increase_per_level_SCAV.left_arm_per_level_SCAV,
            LeftLeg: this.config.increase_per_level_SCAV.left_leg_per_level_SCAV,
            RightArm: this.config.increase_per_level_SCAV.right_arm_per_level_SCAV,
            RightLeg: this.config.increase_per_level_SCAV.right_leg_per_level_SCAV
        };
      
        this.increasePerHealthSkillLevelSCAV = {
            //Amount of health that is added per Health Skill level, broken down per body part from the config.
            Chest: this.config.increase_per_health_skill_level_SCAV.health_skill_thorax_health_per_level_SCAV,
            Stomach: this.config.increase_per_health_skill_level_SCAV.health_skill_stomach_health_per_level_SCAV,
            Head: this.config.increase_per_health_skill_level_SCAV.health_skill_head_health_per_level_SCAV,
            LeftArm: this.config.increase_per_health_skill_level_SCAV.health_skill_left_arm_per_level_SCAV,
            LeftLeg: this.config.increase_per_health_skill_level_SCAV.health_skill_left_leg_per_level_SCAV,
            RightArm: this.config.increase_per_health_skill_level_SCAV.health_skill_right_arm_per_level_SCAV,
            RightLeg: this.config.increase_per_health_skill_level_SCAV.health_skill_right_leg_per_level_SCAV
        };
        
        this.baseHealthPMC = {
            //Amount of base health per body part, based on the config.
            Chest: this.config.base_health_PMC.thorax_base_health_PMC,
            Stomach: this.config.base_health_PMC.stomach_base_health_PMC,
            Head: this.config.base_health_PMC.head_base_health_PMC,
            LeftArm: this.config.base_health_PMC.left_arm_base_health_PMC,
            LeftLeg: this.config.base_health_PMC.left_leg_base_health_PMC,
            RightArm: this.config.base_health_PMC.right_arm_base_health_PMC,
            RightLeg: this.config.base_health_PMC.right_leg_base_health_PMC
        };
    
        this.baseHealthSCAV = {
            //Amount of base health per body part, based on the config.
            Chest: this.config.base_health_SCAV.thorax_base_health_SCAV,
            Stomach: this.config.base_health_SCAV.stomach_base_health_SCAV,
            Head: this.config.base_health_SCAV.head_base_health_SCAV,
            LeftArm: this.config.base_health_SCAV.left_arm_base_health_SCAV,
            LeftLeg: this.config.base_health_SCAV.left_leg_base_health_SCAV,
            RightArm: this.config.base_health_SCAV.right_arm_base_health_SCAV,
            RightLeg: this.config.base_health_SCAV.right_leg_base_health_SCAV
        };
    }
}