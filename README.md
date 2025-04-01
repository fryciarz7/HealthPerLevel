# HealthPerLevel

A mod for SPT-AKI, an offline single player emulator for the game Escape from Tarkov.

Adds health to all bodyparts of the players PMC and SCAV characters based on their respective levels.

### Alternative heath boost mode:
* Head HP modifier to help surviving aimbots (default x 3.0)
* Staggered health bonus per nth-level:
  * Every 3 level: Arm HP +3
  * Every 5 level: Stomach HP +7 and Leg HP +5
  * Every 7 level: Head HP +5, Thorax HP +7
* Health skill level bonus is now a multiplier on the Alternative Base Health Preset
  |       |           |       |       |             |       |       |               |
  |      -|          -|      -|      -|            -|      -|      -|              -|
  |       | Alt. Base | Lv.21 | Lv.51 | Lv.99 (+)   | Skill | Elite | ABSOLUTE MAX  |
  |Thorax |      `90` | `+21` | `+49` | `+100(98)`  | `+60`| `+120`|          `310` |
  |Head   |      `30` | `+15` | `+35` | `+75(70)`   | `+15(45)`|`+30(90)`|`135(195)`|
  |Stomach|      `90` | `+28` | `+70` | `+135(133)` | `+37` | `+75` |         `300` |
  |Arms   |      `60` | `+21` | `+51` | `+100(99)`  | `+22` | `+45` |         `205` |
  |Legs   |      `75` | `+20` | `+50` | `+100(95)`  | `+30` | `+60` |         `235` |