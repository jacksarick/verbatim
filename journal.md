##October 11:
Wow. Long break. Not really restarting, just revisitng for a bit. Maybe I'll do more later. Anyway, started using [hotel](https://github.com/typicode/hotel), and this is the command I used to add it as a process: `hotel add 'find . | entr sh -c node server.js' --name teacup --out error.log`

##Aug 31:
OK. Took a break to think, and came back to look at the problem. The server can only handle one socket at a time. What's happening is the `socket` var I haphazardly passed to the `response.js` library is getting shared across all connections. I need to seperate it back out.

##Aug 28: 
Scratch that first solution. I took a long walk and realized it was a bad plan. Two main functions here, LOAD and SAVE, and also BYE. 

When the user calls LOAD, two things happen The server loads the table to a database kept in memory, and adds the table to a list of table the user can access. If the table is already loaded, the server just tests the users password to make sure it's valid.

When a user calls SAVE to a table, the server writes the table in memory to a file. This function is pretty much useless, and you'll see why in a second.

When a user issues BYE, we SAVE all tables the user had called LOAD on. We then check all those tables, and see if anyone else is using them. If no one is using them, we pop them out of memory to free up space.

This model has a few advantages:
- Lighting fast. One person accessing the table or 100, all the same amount of memory.
- Multiple users. My last version sucked because two people couldn't use the same table at the same time.
- Very little redundancy. If 20 people all query the same table, it only gets opened once. 

A few disadvantages:
- I have no idea if this will be secure
- I have no idea if it will actually be faster
- I have no idea if it will actually work

##Aug 27:
Huge issue. Once the file is read in, it is read in across ALL sockets. This is good because it means it is persistent, but also bad because once loaded, it is loaded for everyone.

My solution: every time the user writes to the table, a secondary table is made of the changes. Every time the user reads from a table, the secondary table is checked to make sure nothing has changed. A "SAVE" instruction will commit the secondary table to the master.