const defaultSettings={waterGoal:120,proteinGoal:160,calorieGoal:1850,weekendMode:"satWorkout"};
const baseHabits=[
  ["workout","Workout completed"],["bruno","Bruno walk completed"],["breakfast","Protein breakfast"],
  ["lunch","Meal prep lunch"],["protein","Hit protein goal"],["water","Hit water goal"],
  ["steps","8K–10K steps"],["movement","Moved during work"],["dinner","Dinner on plan"],
  ["prep","Prepped tomorrow"],["sleep","In bed by 10 PM"]
];
const workoutsBase=[
{day:"Monday",title:"Lower Body Strength",items:["5 min treadmill","Leg Press 4x12","Romanian Deadlift 4x10","Walking Lunges 3x12/leg","Leg Extension 3x15","Leg Curl 3x15","10 min incline walk"]},
{day:"Tuesday",title:"Upper Body Push",items:["5 min treadmill","DB Chest Press 4x10","Shoulder Press 4x10","Pec Fly 3x15","Tricep Pushdown 4x12","Lateral Raises 3x15","10 min bike"]},
{day:"Wednesday",title:"Cardio + Full Body",items:["5 min warm-up","Goblet Squats 4x12","Lat Pulldown 4x10","Seated Row 4x10","Incline Push-ups 3x10","Plank 3x45 sec","15 min Stair Climber"]},
{day:"Thursday",title:"Glutes + Hamstrings",items:["Hip Thrust 4x12","Bulgarian Split Squat 3x10","Romanian Deadlift 4x10","Cable Kickbacks 3x15","Hip Abduction 3x20","10 min incline walk"]},
{day:"Friday",title:"Upper Body Pull",items:["Lat Pulldown 4x12","Seated Row 4x12","Single Arm Row 3x12","Face Pull 3x15","Hammer Curl 3x12","Heavy Bag 10 rounds"]},
{day:"Saturday",title:"Short Workout",items:["45–60 min Bruno walk","OR 30 min treadmill","OR 20 min heavy bag","Goal: 10,000+ steps"]},
{day:"Sunday",title:"Rest + Reset",items:["30 min walk","Stretch","Meal prep","Pack lunches","Prepare gym clothes"]}];

const foods={
 "Breakfast":["3 eggs + turkey sausage + toast","Fairlife shake + 2 eggs + toast","Breakfast burrito: eggs, turkey sausage, potatoes","Turkey bacon + 3 eggs + toast","Turkey egg sandwich on toast"],
 "Lunch Meal Prep":["Lemon pepper chicken + white rice","Teriyaki chicken + white rice","Cajun chicken + white rice","Garlic parmesan chicken + white rice","Honey garlic chicken + white rice","BBQ chicken + white rice","Buffalo chicken + white rice","Taco chicken + white rice"],
 "Dinner":["Steak + potato + corn","Salmon + rice + corn","Chicken tacos + rice","Lean burger + potatoes","Chicken Alfredo","Chicken burrito bowl","Loaded protein potato","Grilled chicken + rice","Steak burrito bowl"],
 "Snacks":["Fairlife protein shake","Hard-boiled eggs","Jerky","Popcorn","Rice cakes","Turkey slices","Turkey roll-ups","Turkey bacon","Leftover chicken bites","Rotisserie chicken","Shrimp cocktail","Turkey pepperoni","Small baked potato","Corn cup","Peanut butter toast","Rice + chicken mini bowl","Deviled eggs","Roast beef slices","Chicken dumplings, portion controlled","Chocolate Fairlife milk"]
};

const todayKey=new Date().toISOString().slice(0,10);
const dayIndex=new Date().getDay()===0?6:new Date().getDay()-1;
const state=JSON.parse(localStorage.getItem("jadysjourney_v4")||"{}");
state.settings={...defaultSettings,...(state.settings||{})};
state.days??={};
state.days[todayKey]??={water:0,protein:0,habits:{},habitNotes:{},customHabits:[],workoutDone:{},checkin:{}};
function today(){return state.days[todayKey]}
function save(){localStorage.setItem("jadysjourney_v4",JSON.stringify(state))}
function workouts(){
  const w=JSON.parse(JSON.stringify(workoutsBase));
  if(state.settings.weekendMode==="sunWorkout"){
    w[5]={day:"Saturday",title:"Rest + Reset",items:["Light Bruno walk","Stretch 10–15 min","Optional grocery prep","Relax"]};
    w[6]={day:"Sunday",title:"Short Workout",items:["45–60 min Bruno walk","OR 30 min treadmill","OR 20 min heavy bag","Finish meal prep"]};
  }
  return w;
}
function pct(v,g){return Math.min(100,Math.max(0,(v/g)*100))}
function ring(id,textId,value,goal){document.getElementById(id).style.setProperty("--percent",pct(value,goal)+"%");document.getElementById(textId).textContent=`${value}/${goal}`}
function renderHeader(){
  const w=workouts()[dayIndex];
  todayDate.textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  todayWorkoutName.textContent=`Today's Workout: ${w.title}`;
  workoutTitle.textContent=`${w.day}: ${w.title}`;
}
function renderRings(){
  ring("waterRing","waterText",today().water||0,state.settings.waterGoal);
  ring("proteinRing","proteinText",today().protein||0,state.settings.proteinGoal);
  const total=baseHabits.length + today().customHabits.length;
  const done=[...baseHabits.map(h=>h[0]),...today().customHabits.map(h=>h.id)].filter(id=>today().habits[id]).length;
  document.getElementById("habitRing").style.setProperty("--percent",pct(done,total)+"%");
  habitText.textContent=Math.round(pct(done,total))+"%";
}
function renderHabits(){
  const html=baseHabits.map(([id,label])=>habitHTML(id,label)).join("") + today().customHabits.map(h=>habitHTML(h.id,h.text,true)).join("");
  dailyHabits.innerHTML=html;
}
function habitHTML(id,label,custom=false){
 return `<div class="habit">
   <label><input type="checkbox" data-habit="${id}" ${today().habits[id]?"checked":""}> ${label}</label>
   <input type="text" data-note="${id}" placeholder="Optional note..." value="${today().habitNotes[id]||""}">
   ${custom?`<button onclick="removeCustomHabit('${id}')">Remove</button>`:""}
 </div>`;
}
function renderWorkout(){
 const w=workouts()[dayIndex];
 workoutList.innerHTML=w.items.map((x,i)=>`<div class="exercise ${today().workoutDone[i]?"done":""}">
   <label><input type="checkbox" data-exercise="${i}" ${today().workoutDone[i]?"checked":""}> ${x}</label>
   <input type="text" data-exnote="${i}" placeholder="Weight, reps, note...">
 </div>`).join("");
 weekGrid.innerHTML=workouts().map((w,i)=>`<div class="day ${i===dayIndex?"today":""}"><b>${w.day}</b><h3>${w.title}</h3><ul>${w.items.map(it=>`<li>${it}</li>`).join("")}</ul></div>`).join("");
}
function renderFood(){
 foodLibrary.innerHTML=Object.entries(foods).map(([cat,list])=>`<div class="food-card"><h2>${cat}</h2><ul>${list.map(x=>`<li>${x}</li>`).join("")}</ul></div>`).join("");
}
function streak(){
 let count=0;
 for(let i=0;i<365;i++){
  const d=new Date(); d.setDate(d.getDate()-i);
  const key=d.toISOString().slice(0,10), day=state.days[key];
  if(day && (day.habits?.workout || day.habits?.bruno || day.checkin?.weight)) count++;
  else if(i===0) continue; else break;
 }
 return count;
}
function renderHistory(){
 const keys=Object.keys(state.days).sort().reverse();
 savedDays.textContent=keys.length; streakStats.textContent=streak(); streakCount.textContent=streak();
 const weights=keys.map(k=>Number(state.days[k].checkin?.weight)).filter(Boolean);
 latestWeight.textContent=weights[0]?weights[0]+" lbs":"—";
 lowestWeight.textContent=weights.length?Math.min(...weights)+" lbs":"—";
 history.innerHTML=keys.map(k=>{const d=state.days[k];return `<div class="history-item"><b>${k}</b><br>Weight: ${d.checkin?.weight||"—"} lbs | Calories: ${d.checkin?.calories||"—"} | Steps: ${d.checkin?.steps||"—"}<br>Water: ${d.water||0} oz | Protein: ${d.protein||0}g<br><em>${d.checkin?.note||""}</em></div>`}).join("");
}
function renderSettings(){
 waterGoal.value=state.settings.waterGoal; proteinGoal.value=state.settings.proteinGoal; calorieGoal.value=state.settings.calorieGoal;
 document.querySelectorAll("input[name=weekendMode]").forEach(r=>r.checked=r.value===state.settings.weekendMode);
}
function render(){renderHeader();renderRings();renderHabits();renderWorkout();renderFood();renderHistory();renderSettings();}
function addWater(n){today().water=Math.max(0,(today().water||0)+n);save();render()}
function addProtein(n){today().protein=Math.max(0,(today().protein||0)+n);save();render()}
function saveToday(){today().checkin={weight:weight.value||today().checkin.weight,calories:calories.value||today().checkin.calories,steps:steps.value||today().checkin.steps,note:note.value||today().checkin.note};["weight","calories","steps","note"].forEach(id=>document.getElementById(id).value="");save();render()}
function addCustomHabit(){const txt=customHabitText.value.trim(); if(!txt)return; today().customHabits.push({id:"custom_"+Date.now(),text:txt}); customHabitText.value=""; save(); render();}
function removeCustomHabit(id){today().customHabits=today().customHabits.filter(h=>h.id!==id); delete today().habits[id]; save(); render();}
function completeWorkout(){today().habits.workout=true; workouts()[dayIndex].items.forEach((_,i)=>today().workoutDone[i]=true); save(); render();}
function saveSettings(){state.settings.waterGoal=Number(waterGoal.value)||120;state.settings.proteinGoal=Number(proteinGoal.value)||160;state.settings.calorieGoal=Number(calorieGoal.value)||1850;save();render();}
function clearAll(){if(confirm("Clear all saved JadysJourney data on this device?")){localStorage.removeItem("jadysjourney_v4");location.reload();}}
document.addEventListener("change",e=>{
 if(e.target.dataset.habit){today().habits[e.target.dataset.habit]=e.target.checked}
 if(e.target.dataset.note){today().habitNotes[e.target.dataset.note]=e.target.value}
 if(e.target.dataset.exercise){today().workoutDone[e.target.dataset.exercise]=e.target.checked}
 if(e.target.name==="weekendMode"){state.settings.weekendMode=e.target.value}
 save();render();
});
document.addEventListener("input",e=>{if(e.target.dataset.note){today().habitNotes[e.target.dataset.note]=e.target.value;save()}});
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".tab,.screen").forEach(x=>x.classList.remove("active"));
 btn.classList.add("active"); document.getElementById(btn.dataset.tab).classList.add("active");
}));
resetTodayBtn.addEventListener("click",()=>{if(confirm("Reset only today? Past days stay saved.")){state.days[todayKey]={water:0,protein:0,habits:{},habitNotes:{},customHabits:[],workoutDone:{},checkin:{}};save();render();}});
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;installBtn.classList.remove("hidden")});
installBtn.addEventListener("click",async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;installBtn.classList.add("hidden")}});
if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js")}
render();
