# Lander Changelog



### v1.1.2
 - Fix Lander path looping causing it to cover the whole screen
 - Lander path now only loops twice
 -- Maximum path loops is now configurable in the options menu


### v1.1.1
 - Minor fixes involving version number updates


### v1.1.0
 - Fixed the bugged path for the Easy and Normal difficulties
 - Added new settings
 -- Number of path points setting to have a longer or shorter path (0-3600)
 -- Path resolution to sub divide the path points and make the path more clear (1-8)


### v1.0.1
 - Simplified the speedUpdates, doCrashParts, and getTime boolean variables into one isLanded variable
 -- Note: The drawLander variable cannot be simplified due to it's relation to crashing.


## v1.0.0
 - Modified default colors (and other colors)
 - Added gradient shading to Lander
 - Added booster flames
 - Made crashed Lander break into pieces
 - Added looping background music track
 - Added spin direction indicators
 - Added options menu (press ESC to open)
 -- Confetti toggled moved to here
 -- Music toggle
 -- Lander color pickers
 -- Simple shading option (removes gradient, only uses 1st color)
 -- Epilepsy mode (makes booster flames not flash colors and lengths)
 -- Difficulty setting
 --- Easy Mode lowers all movement variables (less sensitive controls)
 --- Normal Mode is play as normal
 --- Hard mode removes spin direction indicators and path
 --- Apollo mode removes entire HUD
 -- Options selected save and load upon website closing and reopening
 - Added unique crash/landing messages depending on the score you get


## v0.6.1
 - Fixed lander hitbox to be more accurate using trig
 - Added screen loop tracker