export abstract class ConfigExports 
{
    private static config = require("../config/config.json");

    public static splitScavAndPmcHealth = this.config.split_scav_and_PMC_health;
    public static levelsPerIncrementPmc = this.config.levels_per_increment_PMC;
    public static healthPerHealthSkillLevelPmc = this.config.health_per_health_skill_level_pmc;
    public static healthSkillLevelsPerIncrementPmc = this.config.health_skill_levels_per_increment_PMC;
    public static levelsPerIncrementScav = this.config.levels_per_increment_SCAV;
    public static healthPerHealthSkillLevelScav = this.config.health_per_health_skill_level_scav;
    public static healthSkillLevelsPerIncrementScav = this.config.health_skill_levels_per_increment_SCAV;
    public static increasePerLevelPMC: { [key: string]: number } = {
        //Amount of health that is added per level, broken down per body part from the config.
        Chest: this.config.thorax_health_per_level_PMC,
        Stomach: this.config.stomach_health_per_level_PMC,
        Head: this.config.head_health_per_level_PMC,
        LeftArm: this.config.left_arm_per_level_PMC,
        LeftLeg: this.config.left_leg_per_level_PMC,
        RightArm: this.config.right_arm_per_level_PMC,
        RightLeg: this.config.right_leg_per_level_PMC
    };

    public static increasePerHealthSkillLevelPMC: { [key: string]: number } = {
        //Amount of health that is added per Health Skill level, broken down per body part from the config.
        Chest: this.config.health_skill_thorax_health_per_level_PMC,
        Stomach: this.config.health_skill_stomach_health_per_level_PMC,
        Head: this.config.health_skill_head_health_per_level_PMC,
        LeftArm: this.config.health_skill_left_arm_per_level_PMC,
        LeftLeg: this.config.health_skill_left_leg_per_level_PMC,
        RightArm: this.config.health_skill_right_arm_per_level_PMC,
        RightLeg: this.config.health_skill_right_leg_per_level_PMC
    }
  
    public static increasePerLevelSCAV: { [key: string]: number } = {
        //Amount of health that is added per level, broken down per body part from the config.
        Chest: this.config.thorax_health_per_level_SCAV,
        Stomach: this.config.stomach_health_per_level_SCAV,
        Head: this.config.head_health_per_level_SCAV,
        LeftArm: this.config.left_arm_per_level_SCAV,
        LeftLeg: this.config.left_leg_per_level_SCAV,
        RightArm: this.config.right_arm_per_level_SCAV,
        RightLeg: this.config.right_leg_per_level_SCAV
    };
  
    public static increasePerHealthSkillLevelSCAV: { [key: string]: number } = {
        //Amount of health that is added per Health Skill level, broken down per body part from the config.
        Chest: this.config.health_skill_thorax_health_per_level_SCAV,
        Stomach: this.config.health_skill_stomach_health_per_level_SCAV,
        Head: this.config.health_skill_head_health_per_level_SCAV,
        LeftArm: this.config.health_skill_left_arm_per_level_SCAV,
        LeftLeg: this.config.health_skill_left_leg_per_level_SCAV,
        RightArm: this.config.health_skill_right_arm_per_level_SCAV,
        RightLeg: this.config.health_skill_right_leg_per_level_SCAV
    };
    
    public static baseHealthPMC: { [key: string]: number } = {
        //Amount of base health per body part, based on the config.
        Chest: this.config.thorax_base_health_PMC,
        Stomach: this.config.stomach_base_health_PMC,
        Head: this.config.head_base_health_PMC,
        LeftArm: this.config.left_arm_base_health_PMC,
        LeftLeg: this.config.left_leg_base_health_PMC,
        RightArm: this.config.right_arm_base_health_PMC,
        RightLeg: this.config.right_leg_base_health_PMC
    };

    public static baseHealthSCAV: { [key: string]: number } = {
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