// دالة لرمي النرد وترتيب النتائج تنازلياً
function rollDice(num) {
  const dice = [];
  for (let i = 0; i < num; i++) {
    dice.push(1 + Math.floor(Math.random() * 6));
  }
  // ترتيب تنازلي عشان نقارن أعلى قيمة بأعلى قيمة
  dice.sort((a, b) => b - a);
  return dice;
}

// محاكاة معركة واحدة كاملة بين مهاجم ومدافع
function simulateBattle(initialAttacker, initialDefender) {
  let attacker = initialAttacker;
  let defender = initialDefender;

  // المعركة تستمر لين يخلص المدافع أو يبقى عند المهاجم جيش واحد
  while (attacker > 1 && defender > 0) {
    const attackerDiceCount = Math.min(3, attacker - 1); // لازم واحد يبقى في الإقليم
    const defenderDiceCount = Math.min(2, defender);

    const attackerDice = rollDice(attackerDiceCount);
    const defenderDice = rollDice(defenderDiceCount);

    const compareRounds = Math.min(attackerDice.length, defenderDice.length);

    for (let i = 0; i < compareRounds; i++) {
      if (attackerDice[i] > defenderDice[i]) {
        // المدافع يخسر جيش
        defender--;
      } else {
        // المهاجم يخسر جيش عند التعادل أو إذا المدافع أعلى
        attacker--;
      }

      if (attacker <= 1 || defender <= 0) break;
    }
  }

  return {
    attackerArmies: attacker,
    defenderArmies: defender,
  };
}

// تشغيل عدد كبير من المحاكاة لحساب الاحتمالات
function runSimulation(attacker, defender, simulations) {
  let attackerWins = 0;
  let defenderWins = 0;
  let attackerRemainSum = 0;
  let defenderRemainSum = 0;

  for (let i = 0; i < simulations; i++) {
    const result = simulateBattle(attacker, defender);

    if (result.defenderArmies <= 0) {
      attackerWins++;
      attackerRemainSum += result.attackerArmies;
    } else {
      defenderWins++;
      defenderRemainSum += result.defenderArmies;
    }
  }

  return {
    attackerWinProb: (attackerWins / simulations) * 100,
    defenderWinProb: (defenderWins / simulations) * 100,
    attackerAvgRemain: attackerWins ? attackerRemainSum / attackerWins : 0,
    defenderAvgRemain: defenderWins ? defenderRemainSum / defenderWins : 0,
    simulations,
  };
}

// ربط الكود بالواجهة
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("risk-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const attackerArmies = parseInt(
      document.getElementById("attackerArmies").value,
      10
    );
    const defenderArmies = parseInt(
      document.getElementById("defenderArmies").value,
      10
    );
    let simulations = parseInt(
      document.getElementById("simulations").value,
      10
    );

    if (isNaN(simulations) || simulations < 100) {
      simulations = 5000; // قيمة افتراضية
    }

    if (attackerArmies < 2 || defenderArmies < 1) {
      alert("تأكد أن المهاجم لديه على الأقل 2 جيش والمدافع 1 جيش على الأقل.");
      return;
    }

    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = "جارٍ الحساب... قد يأخذ ثواني حسب عدد المحاكاة.";

    // نعطي المتصفح فرصة يحدث الرسالة قبل الحساب الثقيل
    setTimeout(() => {
      const stats = runSimulation(attackerArmies, defenderArmies, simulations);

      const attackerWin = stats.attackerWinProb.toFixed(1);
      const defenderWin = stats.defenderWinProb.toFixed(1);
      const attAvg = stats.attackerAvgRemain.toFixed(1);
      const defAvg = stats.defenderAvgRemain.toFixed(1);

      resultDiv.innerHTML = `
        <p><strong>عدد المحاكاة:</strong> ${stats.simulations.toLocaleString("en-US")}</p>
        <p><strong>احتمال فوز المهاجم 🔴:</strong> ${attackerWin}%</p>
        <p><strong>احتمال فوز المدافع 🔵:</strong> ${defenderWin}%</p>
        <p><strong>متوسط الجيوش المتبقية عند فوز المهاجم:</strong> ${attAvg}</p>
        <p><strong>متوسط الجيوش المتبقية عند فوز المدافع:</strong> ${defAvg}</p>
        <hr>
        <p>استخدم الأرقام هذه عشان تقرر: هل الهجوم يستاهل المغامرة ولا لا؟ 😎</p>
      `;
    }, 50);
  });
});
