# Lander Changelog

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