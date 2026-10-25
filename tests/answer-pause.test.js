import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnswerPause } from '../src/answer-pause.js';
test('six equal new answers prompt once per section after acknowledgment', () => {
 const pause=createAnswerPause();
 for(let n=0;n<5;n++) assert.equal(pause.record(0,String(n),4,true),false);
 assert.equal(pause.record(0,'5',4,true),true);
 pause.acknowledge(0);
 for(let n=6;n<20;n++) assert.equal(pause.record(0,String(n),4,true),false);
 for(let n=0;n<6;n++) assert.equal(pause.record(1,String(n),3,true),n===5);
});
test('corrections and changing answers do not accumulate fake streaks', () => {
 const pause=createAnswerPause();
 for(let n=0;n<10;n++) assert.equal(pause.record(0,'same',5,true),false);
 pause.record(0,'same',2,false);
 for(let n=0;n<5;n++) assert.equal(pause.record(0,String(n),5,true),false);
 assert.equal(pause.record(0,'4',1,false),false);
 assert.equal(pause.record(0,'5',5,true),false);
 pause.reset();
 for(let n=0;n<6;n++) assert.equal(pause.record(0,String(n),1,true),n===5);
});
