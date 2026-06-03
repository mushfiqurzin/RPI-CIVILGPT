import React, { useState } from "react";
import { Calculator, HelpCircle, Layers, Clipboard, ShieldAlert, FileText, CheckCircle } from "lucide-react";

export default function EstimationSuite() {
  const [activeSubSuite, setActiveSubSuite] = useState<"concrete" | "brick" | "plaster" | "rebar">("concrete");

  // State for Concrete Estimator
  const [concreteLength, setConcreteLength] = useState<number>(20);
  const [concreteWidth, setConcreteWidth] = useState<number>(15);
  const [concreteThickness, setConcreteThickness] = useState<number>(5); // in inches
  const [concreteRatioCement, setConcreteRatioCement] = useState<number>(1);
  const [concreteRatioSand, setConcreteRatioSand] = useState<number>(1.5);
  const [concreteRatioChips, setConcreteRatioChips] = useState<number>(3);
  const [concreteWastage, setConcreteWastage] = useState<number>(10); // in %
  const [concreteDryFactor, setConcreteDryFactor] = useState<number>(1.54); // slider 1.45 to 1.60
  const [concreteWaterRatio, setConcreteWaterRatio] = useState<number>(0.45); // slider 0.35 to 0.60

  // State for Brick Estimator
  const [brickLength, setBrickLength] = useState<number>(50);
  const [brickHeight, setBrickHeight] = useState<number>(10);
  const [brickThickness, setBrickThickness] = useState<number>(5); // 5 or 10 inches
  const [mortarRatioCement, setMortarRatioCement] = useState<number>(1);
  const [mortarRatioSand, setMortarRatioSand] = useState<number>(4);
  const [brickWastage, setBrickWastage] = useState<number>(5); // in %
  const [brickSizeSelection, setBrickSizeSelection] = useState<"standard_bd" | "modular_auto" | "english_std" | "concrete_block">("standard_bd");
  const [mortarDryFactor, setMortarDryFactor] = useState<number>(1.54);

  // State for Plastering Estimator
  const [plasterArea, setPlasterArea] = useState<number>(1000); // sqft
  const [plasterThickness, setPlasterThickness] = useState<number>(0.5); // inches
  const [plasterRatioCement, setPlasterRatioCement] = useState<number>(1);
  const [plasterRatioSand, setPlasterRatioSand] = useState<number>(4);
  const [plasterWastage, setPlasterWastage] = useState<number>(10);
  const [plasterDryFactor, setPlasterDryFactor] = useState<number>(1.54);

  // State for Rebar Estimator
  const [rebarDiameter, setRebarDiameter] = useState<number>(16); // mm
  const [rebarLength, setRebarLength] = useState<number>(100); // meters or feet
  const [lengthUnit, setLengthUnit] = useState<"m" | "ft">("m");

  const BRICK_SIZES = {
    standard_bd: {
      name: "ঐতিহ্যবাহী লাল ইট (Bangladesh Tranditional: 9.5\" × 4.5\" × 2.75\")",
      sizeWithMortar: { l: 10, w: 5, h: 3 },
      bricksPerCft: 11.5,
      actualLabel: "9.5\" × 4.5\" × 2.75\""
    },
    modular_auto: {
      name: "অটোমেশিন ব্রিক (Modular Auto-Brick: 9.45\" × 4.5\" × 2.75\")",
      sizeWithMortar: { l: 9.95, w: 5, h: 3 },
      bricksPerCft: 11.8,
      actualLabel: "9.45\" × 4.5\" × 2.75\""
    },
    english_std: {
      name: "ইংরেজ স্ট্যান্ডার্ড ইট (English Standard: 9\" × 4.25\" × 3\")",
      sizeWithMortar: { l: 9.5, w: 4.75, h: 3.5 },
      bricksPerCft: 11.0,
      actualLabel: "9\" × 4.25\" × 3\""
    },
    concrete_block: {
      name: "কংক্রিট হলো ব্লক (Hollow Block: 15.35\" × 7.5\" × 7.5\")",
      sizeWithMortar: { l: 15.85, w: 8, h: 8 },
      bricksPerCft: 1.7,
      actualLabel: "15.35\" × 7.5\" × 7.5\""
    }
  };

  // Concrete Calculations
  const calculateConcrete = () => {
    // Volume in cft
    const thicknessInFt = concreteThickness / 12;
    const wetVolume = concreteLength * concreteWidth * thicknessInFt;
    // Dry volume factor is adjustable now
    const dryVolumeWithoutWastage = wetVolume * concreteDryFactor;
    const dryVolumeTotal = dryVolumeWithoutWastage * (1 + concreteWastage / 100);

    const sumRatio = concreteRatioCement + concreteRatioSand + concreteRatioChips;
    
    // Outputs
    const cementVolume = sumRatio > 0 ? (dryVolumeTotal * concreteRatioCement) / sumRatio : 0;
    const sandVolume = sumRatio > 0 ? (dryVolumeTotal * concreteRatioSand) / sumRatio : 0;
    const chipsVolume = sumRatio > 0 ? (dryVolumeTotal * concreteRatioChips) / sumRatio : 0;

    // 1 Bag cement = 1.25 cft or 50 kg
    const cementBags = cementVolume / 1.25;
    const cementWeightKg = cementBags * 50;
    const waterLiters = cementWeightKg * concreteWaterRatio;

    // M3 volumes (1 Cubic Meter = 35.3147 CFT)
    const wetVolumeM3 = wetVolume / 35.3147;
    const dryVolumeTotalM3 = dryVolumeTotal / 35.3147;

    return {
      wetVolume: wetVolume.toFixed(2),
      dryVolume: dryVolumeTotal.toFixed(2),
      wetVolumeM3: wetVolumeM3.toFixed(2),
      dryVolumeM3: dryVolumeTotalM3.toFixed(2),
      cementBags: Math.ceil(cementBags),
      cementWeightKg: cementWeightKg.toFixed(0),
      sandVolume: sandVolume.toFixed(2),
      sandM3: (sandVolume / 35.3147).toFixed(2),
      chipsVolume: chipsVolume.toFixed(2),
      chipsM3: (chipsVolume / 35.3147).toFixed(2),
      waterLiters: Math.ceil(waterLiters),
      steps: [
        `১. ভেজা আয়তন (Wet Volume) = ${concreteLength} ft × ${concreteWidth} ft × (${concreteThickness}/12) ft = ${wetVolume.toFixed(2)} CFT (বা ${wetVolumeM3.toFixed(2)} m³)`,
        `২. ড্রাই ভলিউম গুণক (Dry Volume Factor) = ${concreteDryFactor} ব্যবহার করা হয়েছে।`,
        `৩. শুষ্ক আয়তন (Dry Volume) = ভেজা আয়তন × ${concreteDryFactor} = ${wetVolume.toFixed(2)} × ${concreteDryFactor} = ${dryVolumeWithoutWastage.toFixed(2)} CFT`,
        `৪. অপচয় সহ শুষ্ক আয়তন (${concreteWastage}% অপচয়) = ${dryVolumeWithoutWastage.toFixed(2)} × ${(1 + concreteWastage / 100).toFixed(2)} = ${dryVolumeTotal.toFixed(2)} CFT (বা ${dryVolumeTotalM3.toFixed(2)} m³)`,
        `৫. অনুপাতের যোগফল (${concreteRatioCement} : ${concreteRatioSand} : ${concreteRatioChips}) = ${sumRatio}`,
        `৬. সিমেন্ট ব্যাগ সংখ্যা = (শুষ্ক আয়তন × সিমেন্টের অনুপাত) / (অনুপাতের যোগফল × ১.২৫ CFT) = (${dryVolumeTotal.toFixed(2)} × ${concreteRatioCement}) / (${sumRatio} × ১.২৫) = ${cementBags.toFixed(1)} ≈ ${Math.ceil(cementBags)} ব্যাগ (ওজন ≈ ${cementWeightKg.toFixed(0)} কেজি)`,
        `৭. বালি (Sand) = (শুষ্ক আয়তন × বালির অনুপাত) / অনুপাতের যোগফল = (${dryVolumeTotal.toFixed(2)} × ${concreteRatioSand}) / ${sumRatio} = ${sandVolume.toFixed(2)} CFT (বা ${(sandVolume / 35.3147).toFixed(2)} m³)`,
        `৮. পাথর কুচি বা খোয়া = (শুষ্ক আয়তন × খোয়ার অনুপাত) / অনুপাতের যোগফল = (${dryVolumeTotal.toFixed(2)} × ${concreteRatioChips}) / ${sumRatio} = ${chipsVolume.toFixed(2)} CFT (বা ${(chipsVolume / 35.3147).toFixed(2)} m³)`,
        `৯. পানির প্রয়োজনীয়তা (Water Required) = সিমেন্টের মোট ওজন (${cementWeightKg.toFixed(0)} kg) × Water-Cement Ratio (${concreteWaterRatio}) = ${waterLiters.toFixed(0)} লিটার`
      ]
    };
  };

  // Brickwork Calculations
  const calculateBrickwork = () => {
    const thicknessFt = brickThickness / 12;
    const wallVolume = brickLength * brickHeight * thicknessFt; // Volume in cft
    const wallArea = brickLength * brickHeight; // area in sft

    const selectedBrick = BRICK_SIZES[brickSizeSelection] || BRICK_SIZES.standard_bd;
    const bricksPerCft = selectedBrick.bricksPerCft;
    const rawBricks = wallVolume * bricksPerCft;
    const totalBricks = rawBricks * (1 + brickWastage / 100);

    // Mortar estimation: Mortar volume is typically 30% of total volume for traditional Bricks,
    // and about 12% for compact concrete hollow blocks!
    const mortarWetVolumeFactor = brickSizeSelection === "concrete_block" ? 0.12 : 0.30;
    const mortarWetVolume = wallVolume * mortarWetVolumeFactor;
    const mortarDryVolume = mortarWetVolume * mortarDryFactor;
    const sumMortarRatio = mortarRatioCement + mortarRatioSand;

    const cementVol = sumMortarRatio > 0 ? (mortarDryVolume * mortarRatioCement) / sumMortarRatio : 0;
    const sandVol = sumMortarRatio > 0 ? (mortarDryVolume * mortarRatioSand) / sumMortarRatio : 0;
    const cementBags = cementVol / 1.25;

    // Standard practice comparison:
    // SFT rule: Bd standard 5" wall is exactly 5 bricks per SFT. 10" wall is 10 bricks per SFT.
    const ruleSftBricks = brickThickness === 5 ? (wallArea * 5) : (wallArea * 10);

    return {
      wallVolume: wallVolume.toFixed(2),
      wallVolumeM3: (wallVolume / 35.3147).toFixed(2),
      wallArea: wallArea.toFixed(2),
      bricksNo: Math.ceil(totalBricks),
      rawBricks: rawBricks.toFixed(0),
      cementBags: Math.ceil(cementBags),
      sandVol: sandVol.toFixed(2),
      sandM3: (sandVol / 35.3147).toFixed(2),
      rulesComparison: ruleSftBricks.toFixed(0),
      steps: [
        `১. দেয়ালের মোট ভলিউম = ${brickLength} ft × ${brickHeight} ft × (${brickThickness}/12) ft = ${wallVolume.toFixed(2)} CFT (বা ${(wallVolume / 35.3147).toFixed(2)} m³)`,
        `২. নির্বাচিত ইটের ধরণ: ${selectedBrick.name}`,
        `৩. প্রতি ১ CFT গাথুনিতে প্রয়োজন প্রায় ${bricksPerCft} টি ইট।`,
        `৪. সাধারণ ইট সংখ্যা (অপচয় ছাড়া) = ${wallVolume.toFixed(2)} CFT × ${bricksPerCft} = ${rawBricks.toFixed(0)} টি`,
        `৫. অপচয় সহ চূড়ান্ত ইট সংখ্যা (${brickWastage}% অপচয় সহ) = ${rawBricks.toFixed(0)} × ${(1 + brickWastage / 100).toFixed(2)} = ${Math.ceil(totalBricks)} টি`,
        `   (তুলনামূলক ঐতিহ্যগত SFT নিয়ম অনুযায়ী প্রয়োজন: ${ruleSftBricks.toFixed(0)} টি)`,
        `৬. মোট ভেজা মাশলা (Mortar Wet Volume) = দেয়ালের আয়তনের ${(mortarWetVolumeFactor * 100).toFixed(0)}% = ${mortarWetVolume.toFixed(2)} CFT`,
        `৭. শুষ্ক মশলার আয়তন (Dry Mortar Volume) = ভেজা মশলা × ${mortarDryFactor} = ${mortarDryVolume.toFixed(2)} CFT`,
        `৮. সিমেন্ট ব্যাগ সংখ্যা = (শুষ্ক আয়তন × সিমেন্ট অনুপাত) / (অনুপাতের যোগফল × ১.২৫ CFT) = (${mortarDryVolume.toFixed(2)} × ${mortarRatioCement}) / (${sumMortarRatio} × ১.২৫) = ${cementBags.toFixed(1)} ≈ ${Math.ceil(cementBags)} ব্যাগ`,
        `৯. বালি (Sylhet/Local Sand) = (শুষ্ক আয়তন × বালির অনুপাত) / অনুপাতের যোগফল = (${mortarDryVolume.toFixed(2)} × ${mortarRatioSand}) / ${sumMortarRatio} = ${sandVol.toFixed(2)} CFT (বা ${(sandVol / 35.3147).toFixed(2)} m³)`
      ]
    };
  };

  // Plaster Calculations
  const calculatePlaster = () => {
    // Area in sqft, thickness in inches
    const thicknessFt = plasterThickness / 12;
    const wetVolume = plasterArea * thicknessFt;
    const dryVolWithoutWastage = wetVolume * plasterDryFactor;
    const dryVolumeTotal = dryVolWithoutWastage * (1 + plasterWastage / 100);

    const sumRatio = plasterRatioCement + plasterRatioSand;
    const cementVol = sumRatio > 0 ? (dryVolumeTotal * plasterRatioCement) / sumRatio : 0;
    const sandVol = sumRatio > 0 ? (dryVolumeTotal * plasterRatioSand) / sumRatio : 0;

    const cementBags = cementVol / 1.25;

    return {
      wetVolume: wetVolume.toFixed(2),
      dryVolume: dryVolumeTotal.toFixed(2),
      wetVolumeM3: (wetVolume / 35.3147).toFixed(2),
      dryVolumeM3: (dryVolumeTotal / 35.3147).toFixed(2),
      cementBags: Math.ceil(cementBags),
      sandVol: sandVol.toFixed(2),
      sandM3: (sandVol / 35.3147).toFixed(2),
      steps: [
        `১. প্লাস্টারের মোট ভিজা আয়তন = ${plasterArea} sqft × (${plasterThickness}/12) ft = ${wetVolume.toFixed(2)} CFT (বা ${(wetVolume / 35.3147).toFixed(2)} m³)`,
        `২. ড্রাই ভলিউম গুণক = ${plasterDryFactor} (স্নায়ুশূন্যতা এবং ব্রিকের জয়েন্ট ফিলিং পূর্ণ করার জন্য)`,
        `৩. শুষ্ক আয়তন (Dry Volume) = ভিজা প্লাস্টার আয়তন × ${plasterDryFactor} = ${dryVolWithoutWastage.toFixed(2)} CFT`,
        `৪. অপচয় ও জয়েন্ট ফিলিং সহ শুষ্ক আয়তন (${plasterWastage}% অপচয়) = ${dryVolumeTotal.toFixed(2)} CFT (বা ${(dryVolumeTotal / 35.3147).toFixed(2)} m³)`,
        `৫. প্লাস্টারিং মসলার অনুপাত = ${plasterRatioCement}:${plasterRatioSand} (যোগফল = ${sumRatio})`,
        `৬. প্রয়োজনীয় সিমেন্ট = (শুষ্ক প্লাস্টার আয়তন × ${plasterRatioCement}) / (${sumRatio} × ১.২৫) = ${cementBags.toFixed(1)} ≈ ${Math.ceil(cementBags)} ব্যাগ`,
        `৭. বালির পরিমাণ = (শুষ্ক আয়তন × ${plasterRatioSand}) / ${sumRatio} = ${sandVol.toFixed(2)} CFT (বা ${(sandVol / 35.3147).toFixed(2)} m³)`
      ]
    };
  };

  // Rebar Calculations
  const calculateRebar = () => {
    // Exact density of steel is 7850 kg/m3.
    const lengthInMeters = lengthUnit === "m" ? rebarLength : rebarLength / 3.28084;
    
    // Theoretical weight calculation comparison:
    // Cross sectional area = pi * D^2 / 4 (in mm2)
    // Unit volume of 1 meter bar = (pi * (D / 1000)^2 / 4) * 1 m3
    // Weight = volume * density = (pi * D^2 / 4,000,000) * 7850 = (pi * 7850 / 4,000,000) * D^2
    const exactUnitWeightKgM = (Math.PI * 7850 * (rebarDiameter * rebarDiameter)) / 4000000;
    const standardUnitWeightKgM = (rebarDiameter * rebarDiameter) / 162.2;
    
    // Total weights
    const totalWeightKgStandard = standardUnitWeightKgM * lengthInMeters;
    const totalWeightKgExact = exactUnitWeightKgM * lengthInMeters;

    const barAreaSqMm = Math.PI * (rebarDiameter / 2) * (rebarDiameter / 2);

    return {
      unitWeightKgM: standardUnitWeightKgM.toFixed(3),
      unitWeightKgMExact: exactUnitWeightKgM.toFixed(4),
      unitWeightLbFt: (standardUnitWeightKgM * 0.671969).toFixed(3),
      unitWeightLbFtExact: (exactUnitWeightKgM * 0.671969).toFixed(3),
      totalWeightKg: totalWeightKgStandard.toFixed(2),
      totalWeightKgExact: totalWeightKgExact.toFixed(2),
      totalWeightLbs: (totalWeightKgStandard * 2.20462).toFixed(1),
      totalWeightTons: (totalWeightKgStandard / 1000).toFixed(3),
      totalWeightQuintals: (totalWeightKgStandard / 100).toFixed(2),
      barArea: barAreaSqMm.toFixed(1),
      steps: [
        `১. থিওরিটিক্যাল ওজনের মূল সূত্র ডেরিভেশন:`,
        `   ক্ষেত্রফল (A) = π × (D / ২০০০০)² = ${barAreaSqMm.toFixed(2)} mm²`,
        `   ডবলু = A × ১m × ৭৮৫০ kg/m³ = ${exactUnitWeightKgM.toFixed(4)} kg/m (তাত্ত্বিক)`,
        `২. ড্রাইভ শর্টকাট সূত্র: D² / ১৬২.২ (কেজি প্রতি মিটার)`,
        `   D = ${rebarDiameter} mm`,
        `৩. প্রতি মিটার রডের ব্যবহারিক ওজন = ${rebarDiameter}² / ১৬২.২ = ${standardUnitWeightKgM.toFixed(3)} Kg/m`,
        `   (তাত্ত্বিক নির্ভুল মান = ${exactUnitWeightKgM.toFixed(4)} Kg/m)`,
        lengthUnit === "ft" 
          ? `৪. দৈর্ঘ্য ফিট থেকে মিটারে রূপান্তর: ${rebarLength} ft ÷ ৩.২৮০৮ = ${lengthInMeters.toFixed(2)} মিটার`
          : `৪. মোট দৈর্ঘ্য = ${rebarLength} মিটার`,
        `৫. মোট ওজন (Total Weight) = প্রতি মিটারের ওজন × মোট দৈর্ঘ্য = ${standardUnitWeightKgM.toFixed(3)} Kg/m × ${lengthInMeters.toFixed(2)} m = ${totalWeightKgStandard.toFixed(2)} Kg`,
        `৬. কনভার্সন ইউনিটসমূহ:`,
        `   • পাউন্ড (Pounds) = ${totalWeightKgStandard.toFixed(2)} × ২.২০৪৬ = ${(totalWeightKgStandard * 2.20462).toFixed(1)} lbs`,
        `   • মেটকা কুইন্টাল = ${(totalWeightKgStandard / 100).toFixed(2)} Qnt (১ কুইন্টাল = ১০০ কেজি)`,
        `   • মেটকা টন (Metric Ton) = ${(totalWeightKgStandard / 1000).toFixed(3)} Tons (১ টন = ১০০০ কেজি)`
      ]
    };
  };

  // Triggering the math
  const concreteRes = calculateConcrete();
  const brickRes = calculateBrickwork();
  const plasterRes = calculatePlaster();
  const rebarRes = calculateRebar();

  return (
    <div id="estimation_dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Selector Navigation Sidebar */}
      <div className="lg:col-span-3 flex flex-col md:flex-row lg:flex-col gap-2 p-3 lg:p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-1 lg:mb-3 w-full md:w-auto lg:w-full">
          <Calculator className="w-5 h-5 text-orange-500 shrink-0" />
          <h3 className="font-semibold text-white tracking-tight text-xs lg:text-sm">নির্মাণ হিসাব ক্যালকুলেটর</h3>
        </div>
        
        <button
          onClick={() => setActiveSubSuite("concrete")}
          className={`flex items-center gap-2 w-full md:w-auto lg:w-full text-left p-2.5 lg:p-3 rounded-lg text-xs lg:text-sm transition-all duration-200 ${
            activeSubSuite === "concrete"
              ? "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/10"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>কংক্রিট ঢালাই হিসাব</span>
        </button>

        <button
          onClick={() => setActiveSubSuite("brick")}
          className={`flex items-center gap-2 w-full md:w-auto lg:w-full text-left p-2.5 lg:p-3 rounded-lg text-xs lg:text-sm transition-all duration-200 ${
            activeSubSuite === "brick"
              ? "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/10"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>ইটের দেয়াল গাঁথুনি</span>
        </button>

        <button
          onClick={() => setActiveSubSuite("plaster")}
          className={`flex items-center gap-2 w-full md:w-auto lg:w-full text-left p-2.5 lg:p-3 rounded-lg text-xs lg:text-sm transition-all duration-200 ${
            activeSubSuite === "plaster"
              ? "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/10"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>ওয়াল প্লাস্টারিং পরিমাণ</span>
        </button>

        <button
          onClick={() => setActiveSubSuite("rebar")}
          className={`flex items-center gap-2 w-full md:w-auto lg:w-full text-left p-2.5 lg:p-3 rounded-lg text-xs lg:text-sm transition-all duration-200 ${
            activeSubSuite === "rebar"
              ? "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/10"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>রড (Rebar) ইউনিটের ওজন</span>
        </button>

        <div className="mt-2 md:mt-0 lg:mt-8 p-3 rounded-lg bg-orange-950/40 border border-orange-900/30 text-[10px] lg:text-xs text-orange-200 space-y-1 w-full md:hidden lg:block">
          <div className="flex items-center gap-1.5 font-semibold text-orange-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>প্রফেশনাল গাইডলাইন</span>
          </div>
          <p className="leading-relaxed">
            এখানে হিসেবকৃত মালামালের পরিমাণ তাত্ত্বিক আদর্শ অনুপাত ও অপচয় সহ হিসেব করা হয়েছে। সাইটে ব্যবহারের সময় অপচয় এবং পানি-সিমেন্ট অনুপাত ভালোভাবে পর্যবেক্ষণ করুন।
          </p>
        </div>
      </div>

      {/* Main Suite Content Area */}
      <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-xl p-5 lg:p-6 text-slate-100 flex flex-col gap-6">
        
        {/* CONCRETE ESTIMATOR TAB */}
        {activeSubSuite === "concrete" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-white">কংক্রিট কাস্টিং মালামাল এস্টিমেটর (RCC Slab/Beam/Post)</h4>
                <p className="text-xs text-slate-400">দৈর্ঘ্য, প্রস্থ ও গভীরতা দিয়ে সিমেন্ট, চমৎকার বালি এবং পাথর কুচি বা খোয়ার ভলিউম নির্ধারণ করুন।</p>
              </div>
              <div className="flex gap-2 text-[10px] items-center">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                  Dry Factor: {concreteDryFactor}
                </span>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                  W/C Ratio: {concreteWaterRatio}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs Form */}
              <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block mb-2">মাত্রা নির্ধারণ (Dimensions)</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">দৈর্ঘ্য (Length - Feet)</label>
                    <input
                      type="number"
                      value={concreteLength}
                      onChange={(e) => setConcreteLength(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">প্রস্থ (Width - Feet)</label>
                    <input
                      type="number"
                      value={concreteWidth}
                      onChange={(e) => setConcreteWidth(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs block text-slate-400 mb-1">পুরুত্ব বা গভীরতা (Thickness - Inch)</label>
                  <input
                    type="number"
                    value={concreteThickness}
                    onChange={(e) => setConcreteThickness(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block pt-2 mb-2">অনুপাত সেট (Mix Ratio Cement : Sand : Stone)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] block text-slate-400 mb-1">Cement</label>
                    <input
                      type="number"
                      value={concreteRatioCement}
                      onChange={(e) => setConcreteRatioCement(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-1.5 text-sm text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block text-slate-400 mb-1">Sand</label>
                    <input
                      type="number"
                      value={concreteRatioSand}
                      onChange={(e) => setConcreteRatioSand(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-1.5 text-sm text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block text-slate-400 mb-1">Stone/Chips</label>
                    <input
                      type="number"
                      value={concreteRatioChips}
                      onChange={(e) => setConcreteRatioChips(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-1.5 text-sm text-white text-center font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850/60 space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>শুষ্ক ভলিউম সহগুণক (Dry Volume Factor)</span>
                      <span className="font-mono text-orange-400 font-bold">{concreteDryFactor}</span>
                    </div>
                    <input
                      type="range"
                      min={1.40}
                      max={1.65}
                      step={0.01}
                      value={concreteDryFactor}
                      onChange={(e) => setConcreteDryFactor(Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>পানি-সিমেন্ট অনুপাত (Water-Cement Ratio)</span>
                      <span className="font-mono text-blue-400 font-bold">{concreteWaterRatio}</span>
                    </div>
                    <input
                      type="range"
                      min={0.35}
                      max={0.65}
                      step={0.01}
                      value={concreteWaterRatio}
                      onChange={(e) => setConcreteWaterRatio(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs block text-slate-400 mb-1">অপচয় সহগ (Wastage Rate %)</label>
                  <input
                    type="number"
                    value={concreteWastage}
                    onChange={(e) => setConcreteWastage(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Outputs Summary */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">হিসাবকৃত ফলাফল (Summary Report)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">ভেজা আয়তন (Wet)</div>
                      <div className="text-sm font-mono font-bold text-white leading-tight">
                        {concreteRes.wetVolume} CFT
                      </div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">≈ {concreteRes.wetVolumeM3} m³</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">শুষ্ক আয়তন (Dry)</div>
                      <div className="text-sm font-mono font-bold text-white leading-tight font-extrabold text-orange-400">
                        {concreteRes.dryVolume} CFT
                      </div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">≈ {concreteRes.dryVolumeM3} m³</div>
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded col-span-2 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-orange-400 font-medium">প্রয়োজনীয় সিমেন্ট (Cement Area)</div>
                        <div className="text-3xl font-mono font-bold text-orange-500 mt-1">
                          {concreteRes.cementBags} <span className="text-sm">ব্যাগ (Bags)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">মোট সিমেন্টের ওজন</div>
                        <div className="text-sm font-mono font-semibold text-white">{concreteRes.cementWeightKg} Kg</div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">বালি (Sand Vol)</div>
                      <div className="text-sm font-mono font-bold text-teal-400">
                        {concreteRes.sandVolume} CFT
                      </div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">≈ {concreteRes.sandM3} m³</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">পাথর/খোয়া কুচি</div>
                      <div className="text-sm font-mono font-bold text-cyan-400">
                        {concreteRes.chipsVolume} CFT
                      </div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">≈ {concreteRes.chipsM3} m³</div>
                    </div>
                    <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded col-span-2">
                      <div className="text-xs text-blue-400 font-medium">প্রয়োজনীয় পানি (Assumed Water Required)</div>
                      <div className="text-xl font-mono font-bold text-blue-500 mt-1">{concreteRes.waterLiters} <span className="text-xs text-slate-400 font-sans">লিটার (Liters)</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 flex gap-2 items-start text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                  <span>
                    <strong>টিপস:</strong> ১ ব্যাগ সাধারণ পোর্টল্যান্ড সিমেন্ট (OPC) এর নির্দিষ্ট আয়তন ১.২৫ CFT বা ৫০ কেজি হয়ে থাকে। পানি-সিমেন্টের অনুপাত কংক্রিটের শক্তি ও কর্মক্ষমতা (Workability) সরাসরি নিয়ন্ত্রণ করে।
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold tracking-wider text-slate-200">ধাপ ভিত্তিক ব্যাখ্যা (Step-by-Step Breakdown)</span>
              </div>
              <ol className="space-y-2 text-sm text-slate-300 font-mono">
                {concreteRes.steps.map((step, idx) => (
                  <li key={idx} className="hover:bg-slate-800/40 p-1.5 rounded">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
        {activeSubSuite === "brick" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-850 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-white">ইটের দেয়াল গাঁথুনি মালামাল এস্টিমেটর (Wall Brickwork)</h4>
                <p className="text-xs text-slate-400">দেয়ালের আকার ও পুরত্ব দিয়ে প্রয়োজনীয় ইট, সিমেন্ট ব্যাগ এবং কন্সট্রাকশন বালি হিসাব করুন।</p>
              </div>
              <div className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                Mortar Dry Factor: {mortarDryFactor}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs Form */}
              <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block mb-2">ইটের ধরণ নির্বাচন (Brick Profile)</span>
                
                <div>
                  <label className="text-xs block text-slate-400 mb-1">ইটের সাইজ এবং প্রোফাইল</label>
                  <select
                    value={brickSizeSelection}
                    onChange={(e) => setBrickSizeSelection(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white"
                  >
                    <option value="standard_bd">ঐতিহ্যবাহী লাল ইট (Bangladesh Standard 9.5" × 4.5" × 2.75")</option>
                    <option value="modular_auto">অটোমেশিন ব্রিক (Modular Auto-Brick 9.45" × 4.5" × 2.75")</option>
                    <option value="english_std">ইংরেজ স্ট্যান্ডার্ড ইট (English Standard 9" × 4.25" × 3")</option>
                    <option value="concrete_block">কংক্রিট হলো ব্লক (Hollow Block 15.35" × 7.5" × 7.5")</option>
                  </select>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block mb-2">দেয়ালের ডাইমেনশন</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">মোট দৈর্ঘ্য (Length - Feet)</label>
                    <input
                      type="number"
                      value={brickLength}
                      onChange={(e) => setBrickLength(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">মোট উচ্চতা (Height - Feet)</label>
                    <input
                      type="number"
                      value={brickHeight}
                      onChange={(e) => setBrickHeight(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs block text-slate-400 mb-1">দেয়ালের প্রস্থ বা পুরুত্ব (Thickness)</label>
                  <select
                    value={brickThickness}
                    onChange={(e) => setBrickThickness(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  >
                    <option value={5}>৫ ইঞ্চি দেয়াল (৫" Wall - Single Layer)</option>
                    <option value={10}>১০ ইঞ্চি দেয়াল (১০" Wall - Double Layer / Load Bearing)</option>
                  </select>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block pt-2 mb-2">মশলার অনুপাত (Mortar Ratio Cement : Sand)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">সিমেন্ট অংশ</label>
                    <input
                      type="number"
                      value={mortarRatioCement}
                      onChange={(e) => setMortarRatioCement(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">বালি অংশ</label>
                    <input
                      type="number"
                      value={mortarRatioSand}
                      onChange={(e) => setMortarRatioSand(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white text-center font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850/60">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>মশলার ড্রাই ফ্যাক্টর (Dry Factor)</span>
                    <span className="font-mono text-orange-400 font-bold">{mortarDryFactor}</span>
                  </div>
                  <input
                    type="range"
                    min={1.40}
                    max={1.65}
                    step={0.01}
                    value={mortarDryFactor}
                    onChange={(e) => setMortarDryFactor(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs block text-slate-400 mb-1">অপচয় সহগ (Wastage Rate %)</label>
                  <input
                    type="number"
                    value={brickWastage}
                    onChange={(e) => setBrickWastage(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Outputs Summary */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">গাঁথুনি মালামালের ফলাফল</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded col-span-2">
                      <div className="text-xs text-orange-400 font-semibold mb-1">প্রয়োজনীয় ইট সংখ্যা (Quantity of Bricks)</div>
                      <div className="text-4xl font-mono font-bold text-orange-500">{brickRes.bricksNo} <span className="text-sm">টি (Nos)</span></div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">সিমেন্ট (Cement Bags)</div>
                      <div className="text-lg font-mono font-bold text-white">{brickRes.cementBags} ব্যাগ</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">বালি (Sand Volume)</div>
                      <div className="text-lg font-mono font-bold text-teal-400">{brickRes.sandVol} CFT</div>
                      <div className="text-[10px] text-slate-550 font-mono">≈ {brickRes.sandM3} m³</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 col-span-2">
                      <div className="text-xs text-slate-400">গাঁথুনির মোট ক্ষেত্রফল / মোট আয়তন</div>
                      <div className="text-sm text-slate-200 mt-1">
                        ক্ষেত্রফল: <strong className="font-mono">{brickRes.wallArea}</strong> SFT | 
                        আয়তন: <strong className="font-mono">{brickRes.wallVolume}</strong> CFT <span className="text-xs text-slate-400 font-mono">({brickRes.wallVolumeM3} m³)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 flex gap-2 items-start text-xs text-slate-400">
                  <Clipboard className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                  <span>
                    <strong>সার্ভেয়িং গাইড:</strong> দেয়ালের বিভিন্ন দরজার ওপেনিং ও জালানার অংশ মোট হিসাব থেকে বাদ দিতে হবে। এই গণনাটি সম্পূর্ণ সলিড দেয়ালের গাঁথুনির জন্য প্রযোজ্য।
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold tracking-wider text-slate-200">ধাপ ভিত্তিক ব্যাখ্যা (Step-by-Step Breakdown)</span>
              </div>
              <ol className="space-y-2 text-sm text-slate-300 font-mono">
                {brickRes.steps.map((step, idx) => (
                  <li key={idx} className="hover:bg-slate-800/40 p-1.5 rounded">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* PLASTER ESTIMATOR TAB */}
        {activeSubSuite === "plaster" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-850 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-white">ওয়াল প্লাস্টারিং পরিমাণ ক্যালকুলেটর (Plaster Estimator)</h4>
                <p className="text-xs text-slate-400">দেয়ালের প্লাস্টারের ক্ষেত্রফল ও পুরুত্ব দিয়ে সিমেন্ট এবং লাল/সাদা বালির নিখুঁত পরিমাণ বের করুন।</p>
              </div>
              <div className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                Dry Factor: {plasterDryFactor}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs Form */}
              <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block mb-2">প্লাস্টারিং এরিয়া এবং বিবরণ</span>
                
                <div>
                  <label className="text-xs block text-slate-400 mb-1">মোট প্লাস্টার ক্ষেত্রফল (Area - Sq. Ft.)</label>
                  <input
                    type="number"
                    value={plasterArea}
                    onChange={(e) => setPlasterArea(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs block text-slate-400 mb-1">প্লাস্টারের পুরুত্ব (Thickness - Inches)</label>
                  <select
                    value={plasterThickness}
                    onChange={(e) => setPlasterThickness(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  >
                    <option value={0.5}>০.৫ ইঞ্চি (১২ মিমি - সাধারণত অভন্ত্যরীন দেয়ালের জন্য)</option>
                    <option value={0.75}>০.৭৫ ইঞ্চি (১৯ মিমি - বাইরের দেয়াল বা সিলিং এর জন্য)</option>
                    <option value={0.25}>০.২৫ ইঞ্চি (৬মিমি - সাধারণত সিলিং প্লাস্টার এর জন্য)</option>
                  </select>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block pt-2 mb-2">মশলার অনুপাত (Plaster Ratio Cement : Sand)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">সিমেন্ট অংশ</label>
                    <input
                      type="number"
                      value={plasterRatioCement}
                      onChange={(e) => setPlasterRatioCement(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">বালি অংশ</label>
                    <input
                      type="number"
                      value={plasterRatioSand}
                      onChange={(e) => setPlasterRatioSand(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white text-center font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850/60 font-mono">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>প্লাস্টারের ড্রাই ফ্যাক্টর (Dry Factor)</span>
                    <span className="font-mono text-orange-400 font-bold">{plasterDryFactor}</span>
                  </div>
                  <input
                    type="range"
                    min={1.30}
                    max={1.65}
                    step={0.01}
                    value={plasterDryFactor}
                    onChange={(e) => setPlasterDryFactor(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs block text-slate-400 mb-1">অপচয় সহগ (Wastage Rate %)</label>
                  <input
                    type="number"
                    value={plasterWastage}
                    onChange={(e) => setPlasterWastage(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Outputs Summary */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">প্লাস্টার মালামালের হিসাব</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded col-span-2">
                      <div className="text-xs text-orange-400 font-semibold mb-1">প্রয়োজনীয় সিমেন্ট ব্যাগ (OPC)</div>
                      <div className="text-3xl font-mono font-bold text-orange-500">{plasterRes.cementBags} <span className="text-xs font-normal">ব্যাগ (Bags)</span></div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">বালি (Sand Vol)</div>
                      <div className="text-lg font-mono font-bold text-teal-400">{plasterRes.sandVol} CFT</div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">≈ {plasterRes.sandM3} m³</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-xs text-slate-400">ভেজা মশলা আয়তন</div>
                      <div className="text-lg font-mono font-bold text-white leading-tight">{plasterRes.wetVolume} CFT</div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">≈ {plasterRes.wetVolumeM3} m³</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 col-span-2">
                      <div className="text-xs text-slate-400">মোট শুষ্ক আয়তন (অপচয় সহ)</div>
                      <div className="text-sm font-mono font-bold text-orange-400 mt-1">{plasterRes.dryVolume} CFT <span className="text-xs text-slate-400 font-sans font-normal">({plasterRes.dryVolumeM3} m³)</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 flex gap-2 items-start text-xs text-slate-400">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                  <span>
                    <strong>গুণগত মানের পরামর্শ:</strong> বাইরের দেয়ালের প্লাস্টারিং এ আর্দ্রতা রোধে সিপেজ প্রোটেক্টর বা ওয়াটারপ্রুফিং কেমিক্যাল ব্যবহার করুন এবং ন্যূনতম ৭ দিন কিউরিং (Curing) নিশ্চিত করুন।
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold tracking-wider text-slate-200">ধাপ ভিত্তিক ব্যাখ্যা (Step-by-Step Breakdown)</span>
              </div>
              <ol className="space-y-2 text-sm text-slate-300 font-mono">
                {plasterRes.steps.map((step, idx) => (
                  <li key={idx} className="hover:bg-slate-800/40 p-1.5 rounded">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* REBAR ESTIMATOR TAB */}
        {activeSubSuite === "rebar" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-850 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-white">রড (Rebar) ইউনিটের ওজন ও ভলিউম নিরূপণ</h4>
                <p className="text-xs text-slate-400">স্টিলের রিবার (MS Rod) এর ব্যাস ও দৈর্ঘ্য থেকে কেজি বা পাউন্ড ওজন নির্ভুলভাবে নির্ণয় করুন।</p>
              </div>
              <div className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                D² / 162.2
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs Form */}
              <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block mb-2">রডের স্পেসিফিকেশন</span>
                
                <div>
                  <label className="text-xs block text-slate-400 mb-1">রডের ব্যাস (Diameter of bar in mm)</label>
                  <select
                    value={rebarDiameter}
                    onChange={(e) => setRebarDiameter(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                  >
                    <option value={8}>৮ মিমি (8 mm / 2.5 সূতা)</option>
                    <option value={10}>১০ মিমি (10 mm / 3 সূতা)</option>
                    <option value={12}>১২ মিমি (12 mm / 4 সূতা)</option>
                    <option value={16}>১৬ মিমি (16 mm / 5 সূতা)</option>
                    <option value={20}>২০ মিমি (20 mm / 6 সূতা)</option>
                    <option value={22}>২২ মিমি (22 mm / 7 সূতা)</option>
                    <option value={25}>২৫ মিমি (25 mm / 8 সূতা)</option>
                    <option value={32}>৩২ মিমি (32 mm / 10 সূতা)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="text-xs block text-slate-400 mb-1">মোট দৈর্ঘ্য (Total Length)</label>
                    <input
                      type="number"
                      value={rebarLength}
                      onChange={(e) => setRebarLength(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs block text-slate-400 mb-1">একক</label>
                    <select
                      value={lengthUnit}
                      onChange={(e) => setLengthUnit(e.target.value as "m" | "ft")}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none rounded p-2 text-sm text-white font-mono"
                    >
                      <option value="m">Meter</option>
                      <option value="ft">Feet</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-350 space-y-1">
                  <div className="font-semibold text-slate-250 mb-1">সচরাচর ব্যবহৃত সূতা-মিমি সম্পর্ক:</div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                    <div>• ৩ সুতা (3 Soota) ≈ 10 mm</div>
                    <div>• ৪ সুতা (4 Soota) ≈ 12 mm</div>
                    <div>• ৫ সুতা (5 Soota) ≈ 16 mm</div>
                    <div>• ৬ সুতা (6 Soota) ≈ 20 mm</div>
                  </div>
                </div>
              </div>

              {/* Outputs Summary */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">স্টিলের ওজন হিসাবের ফলাফল</span>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded flex justify-between items-center">
                      <div>
                        <div className="text-xs text-orange-400 font-semibold mb-1">মোট স্টিলের ওজন (Total weight D²/162.2)</div>
                        <div className="text-4xl font-mono font-bold text-orange-500">{rebarRes.totalWeightKg} <span className="text-base font-normal text-slate-400">কেজি (Kg)</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">তাত্ত্বিক নিখুঁত ওজন (Density-based)</div>
                        <div className="text-lg font-mono font-bold text-white mt-1">{rebarRes.totalWeightKgExact} <span className="text-xs font-normal text-slate-400">Kg</span></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-950 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">ভলিউম কনভার্সন (Tons)</div>
                        <div className="text-sm font-mono font-bold text-green-400">{rebarRes.totalWeightTons} টন (Tons)</div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">মেট্রিক কুইন্টাল (Quintals)</div>
                        <div className="text-sm font-mono font-bold text-purple-400">{rebarRes.totalWeightQuintals} কুইন্টাল</div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">পাউন্ড ওজন (Weight in Lbs)</div>
                        <div className="text-sm font-mono font-bold text-blue-400">{rebarRes.totalWeightLbs} lbs</div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">রড়ক্ষেত্রফল (Bar Area)</div>
                        <div className="text-sm font-mono font-bold text-white">{rebarRes.barArea} mm²</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-850 pt-3">
                      <span className="text-[11px] font-semibold text-slate-450 uppercase tracking-wider block mb-2 font-mono">ইউনিট ওজন তুলনা (Unit Weight Comparison)</span>
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500 mb-1">ব্যবহারিক হিসাব (D²/162.2)</div>
                          <div>{rebarRes.unitWeightKgM} kg/m</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{rebarRes.unitWeightLbFt} lb/ft</div>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500 mb-1">তাত্ত্বিক সুত্র (A × ρ)</div>
                          <div>{rebarRes.unitWeightKgMExact} kg/m</div>
                          <div className="text-[10px] text-slate-550 mt-0.5">{rebarRes.unitWeightLbFtExact} lb/ft</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 flex gap-2 items-start text-xs text-slate-400">
                  <HelpCircle className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                  <span>
                    <strong>বিএসআরএম / একেএস গাইড:</strong> বাংলাদেশের হাইস্ট্রেংথ ডী-ফর্মড রিবার সাধারণত ৫০০ ডব্লিউ (Grade 72) অথবা ৪০০ ডব্লিউ (Grade 60) ব্যবহার করা হয়। এর ওজন সূত্র সর্বদা আন্তর্জাতিক মানের কাছাকাছি।
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold tracking-wider text-slate-200">ধাপ ভিত্তিক ব্যাখ্যা (Step-by-Step Breakdown)</span>
              </div>
              <ol className="space-y-2 text-sm text-slate-300 font-mono">
                {rebarRes.steps.map((step, idx) => (
                  <li key={idx} className="hover:bg-slate-800/40 p-1.5 rounded">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
