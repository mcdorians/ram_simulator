Graphic RAM Simulator
=================

#Features
* Just one accumulator (No input and output registers)
* Simple Input
* Reduced instruction set
* calculates the cost of the programm execution

#instruction set
* A = B ,where A is the registeradress and B can be of one of the following types: integer value, registeradress, indirect registeradress
* A = B op C ,op has an aritmetic operator (+,-,*,/). The division operator is integerbased
* GOTO L ,continues the execution of the Programm on line L
* GGZ B L ,continues the execution of the Programm on line L, in case B is greather then 0
* GLZ B L ,continues the execution of the Programm on line L, in case B is less then 0
* GZ B L ,continues the execution of the Programm on line L, in case B is equal to 0
* HALT ,stops the RAM (this command is mandatroy and has to be once at the end of each programm)

#How to use
Please follow thease steps to set the simulator up:
* write your programm using the instruction set
* (optinal) define allocation of the inital registers. Plus adds an aditional input field. X deletes all input fields
* A click on "ok" ends the editmode and makes the programm runable
* A click on "edit" sets the programm in editmode and resets all execution parameters
Please follow thease steps to controll the execution:
* the controlls are only usable if the programm is not in editmode
* "next" ,makes the RAM execute the next comand
* "play" ,calls "next" every second
* "pause" ,pauses the automated execution
* "reload" ,resets all execution parameters

#During execution
* the last executed line of the programm ist marked in the programm table
* the accumulator is getting updated during execution
* the costs are getting updated during execution