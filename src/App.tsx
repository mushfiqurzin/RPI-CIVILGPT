import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Layers,
  Terminal,
  FileSpreadsheet,
  Award,
  Send,
  Upload,
  User,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  Trash2,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Info,
  MoreVertical,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { Message, StudyMode } from "./types";
import EstimationSuite from "./components/EstimationSuite";
import MarkdownAndMath from "./components/MarkdownAndMath";

// AutoCAD Command Database for interactive reference
const AUTOCAD_COMMANDS = [
  { command: "LINE", shortcut: "L", category: "Draw", descBangla: "সরল রেখা আঁকার জন্য ব্যবহৃত হয়।", descEnglish: "Creates straight line segments.", useCase: "L [Enter] -> Click start point -> Type length -> [Enter]" },
  { command: "POLYLINE", shortcut: "PL", category: "Draw", descBangla: "সংযুক্ত রেখাসমূহ বা টুডি পলিলিন তৈরি করতে ব্যবহৃত হয়।", descEnglish: "Creates a 2D polyline.", useCase: "PL [Enter] -> Click sequence of points -> Type C to close -> [Enter]" },
  { command: "CIRCLE", shortcut: "C", category: "Draw", descBangla: "বৃত্ত বা বৃত্তচাপ অঙ্কন করার জন্য ব্যবহৃত হয়।", descEnglish: "Creates a circle with center point and radius.", useCase: "C [Enter] -> Click center point -> Type radius -> [Enter]" },
  { command: "ARC", shortcut: "A", category: "Draw", descBangla: "৩ টি পয়েন্ট ভিত্তিক বৃত্তের আংশিক অংশ বা আর্ক আঁকতে ব্যবহৃত হয়।", descEnglish: "Creates an arc using three points.", useCase: "A [Enter] -> Click start -> Click second -> Click end point" },
  { command: "RECTANGLE", shortcut: "REC", category: "Draw", descBangla: "চার কোণ বিশিষ্ট আয়তক্ষেত্র আঁকার জন্য ব্যবহৃত হয়।", descEnglish: "Creates a rectangular polyline.", useCase: "REC [Enter] -> Click first corner -> Type @width,height -> [Enter]" },
  { command: "HATCH", shortcut: "H", category: "Draw", descBangla: "বদ্ধ এলাকার ভেতর কংক্রিট, ইট বা মাটির সিম্বলিক প্যাটার্ন বা হ্যাচ দিতে ব্যবহৃত হয়।", descEnglish: "Fills an enclosed area or selected objects with a hatch pattern.", useCase: "H [Enter] -> Select pattern (e.g., ANSI31) -> Click inside closed boundary -> [Enter]" },
  { command: "TRIM", shortcut: "TR", category: "Modify", descBangla: "কোনো বাউন্ডারি লাইনের সাপেক্ষে অপ্রয়োজনীয় বাড়তি রেখা কেটে ফেলতে কাজ করে।", descEnglish: "Trims objects to meet the edges of other objects.", useCase: "TR [Enter] -> Select cutting edge or [Enter] to select all -> Click segment to trim" },
  { command: "EXTEND", shortcut: "EX", category: "Modify", descBangla: "একটি লাইনকে অন্য আরেকটি বাউন্ডারি লাইন পর্যন্ত বৃদ্ধির জন্য ব্যবহার করা হয়।", descEnglish: "Extends objects to meet the edges of other objects.", useCase: "EX [Enter] -> Select boundary edge -> [Enter] -> Click line to extend" },
  { command: "OFFSET", shortcut: "O", category: "Modify", descBangla: "নির্দিষ্ট দূরত্বে সমান্তরাল লাইন বা কনসেন্ট্রিক বৃত্ত তৈরি করে (যেমন ইটের ওয়ালের ৫\" বা ১০\" অফসেট)।", descEnglish: "Creates concentric circles, parallel lines, and parallel curves.", useCase: "O [Enter] -> Type distance (e.g., 5) -> Click object -> Click side to offset" },
  { command: "COPY", shortcut: "CO", category: "Modify", descBangla: "যেকোনো অবজেক্টকে এক জায়গা থেকে স্পেসিফাইড দূরত্ব বা পয়েন্টে কপি করে।", descEnglish: "Copies objects at a specified distance and direction.", useCase: "CO [Enter] -> Select object -> [Enter] -> Click base point -> Click destination" },
  { command: "MIRROR", shortcut: "MI", category: "Modify", descBangla: "যেকোনো সিমেট্রিক্যাল অবজেক্টের বিপরীত আয়নাসম প্রতিক্রিয়া তৈরি করে।", descEnglish: "Creates a mirrored copy of selected objects.", useCase: "MI [Enter] -> Select object -> Draw mirror line -> [Enter]" },
  { command: "FILLET", shortcut: "F", category: "Modify", descBangla: "দুটি রেখার সংযোগস্থলকে গোল বা নির্দিষ্ট ব্যাসার্ধে বাঁকা করতে বা মেলাতে কাজ করে।", descEnglish: "Rounds and fillets the edges of objects.", useCase: "F [Enter] -> R [Enter] -> Type radius -> Click first line -> Click second line" },
  { command: "DIMLINEAR", shortcut: "DLI", category: "Dimension", descBangla: "যেকোনো দুটি পয়েন্টের সোজা সরল রৈখিক দূরত্ব পরিমাপ ও প্রদর্শন করে।", descEnglish: "Creates a linear dimension.", useCase: "DLI [Enter] -> Click point 1 -> Click point 2 -> Drag dimension line out -> Click" },
  { command: "LAYMCH", shortcut: "LAYMCH", category: "Format", descBangla: "নির্বাচিত অবজেক্টের লেয়ারকে অন্য একটি অবজেক্টের লেয়ারের সাথে ম্যাচ বা সমান করে দেয়।", descEnglish: "Matches the layer of selected objects to a destination object.", useCase: "Type LAYMCH [Enter] -> Select objects to change -> [Enter] -> Select destination layer object" },
  { command: "UNITS", shortcut: "UN", category: "Format", descBangla: "ড্রয়িং এর দৈর্ঘ্য ও কোণের পরিমাপক ইউনিট (Feet/Inch/Millimeter) সেট করার জন্য ব্যবহার করা হয়।", descEnglish: "Controls coordinate and angle display formats and precision.", useCase: "UN [Enter] -> Set Architectural for Feet-Inches / Decimal for millimeters" }
] as const;

// Quick suggestions for student interactions
const QUICK_SUGGESTIONS = [
  "Singly Reinforced Beam এর ডিজাইন ধাপসমূহ কী কী?",
  "বাংলাদেশে ৩ সুতা, ৪ সুতা ও ৫ সুতা রডের ব্যাস কত মিলিমিটার?",
  "১ সিএফটি ব্রিকওয়ার্কে কতটি আদর্শ ইট এবং মশলা লাগে?",
  "সিভিল ইঞ্জিনিয়ারিংয়ে BNBC অনুযায়ী ঢালাইয়ের কিউরিং পিরিয়ড কত দিন?",
  "AutoCAD-এ আর্কিটেকচারাল ইউনিট ও ডাইমেনশন সঠিকভাবে সেট করার নিয়ম বলুন।",
  "Silt Test এবং Slump Test এর কনসেপ্ট সহজ বাংলায় বুঝিয়ে দিন।"
];

// Offline Bank of Civil Engineering Viva Questions for interactive simulation
const OFFLINE_VIVA_BANK = [
  {
    question: "কংক্রিট তৈরিতে সিমেন্ট, বালি এবং খোয়ার আদর্শ অনুপাত ১:১.৫:৩ হলে একে কোন গ্রেডের কংক্রিট বলা হয় এবং এর সাধারণ ব্যবহার ক্ষেত্র কী?",
    sampleAnswerKeywords: ["m20", "beam", "slab", "কাস্টিং", "ঢালাই", "অনুপাত"],
    correctExplanation: "এটি মূলত M20 গ্রেডের কংক্রিট। সাধারণ আবাসিক ভবনের স্ল্যাব (Slab), বীম (Beam) এবং কলাম ঢালাইয়ে ১:১.৫:৩ অনুপাত বহুল ব্যবহৃত হয়। এর ন্যূনতম ২৮ দিনের কম্প্রেসিভ স্ট্রেন্থ ২০ মেগাপ্যাসকেল (MPa) হয়ে থাকে।"
  },
  {
    question: "ফাউন্ডেশন বা মাটির নিচে আরসিসি ঢালাইয়ের ক্ষেত্রে ক্লিয়ার কভার (Clear Cover) সাধারণত কত ইঞ্চি বা মিলিমিটার রাখা উচিত এবং কেন?",
    sampleAnswerKeywords: ["3 inch", "75 mm", "৩ ইঞ্চি", " মরিচা", "জং", "রড", "কভার"],
    correctExplanation: "মাটির নিচে ফাউন্ডেশন বা ফুটিং কাস্টিংয়ে ন্যূনতম ৩ ইঞ্চি (৭৫ মিলিমিটার) ক্লিয়ার কভার রাখতে হয়। কারণ মাটির ক্ষতিকারক আর্দ্রতা, এসিড বা লবণাক্ত পানি যাতে রিবার বা রড পর্যন্ত সহজে পৌঁছে মরিচা সৃষ্টি করতে না পারে।"
  },
  {
    question: "Slump Test বা স্লাম্প টেস্টের মাধ্যমে কংক্রিটের কোন বৈশিষ্ট্য পরিমাপ করা হয়? অতিরিক্ত স্লাম্পের ক্ষতিকর প্রভাব কী?",
    sampleAnswerKeywords: ["workability", "কার্যোপযোগিতা", "পানি", "সেগ্রিগেশন", "শক্তি", "স্লাম্প"],
    correctExplanation: "স্লাম্প টেস্টের মাধ্যমে কংক্রিটের ওয়ার্কবিলিটি বা কার্যোপযোগিতা (Consistency) মাপা হয়। অতিরিক্ত পানি ও স্লাম্পের ফলে কংক্রিটের শক্তি হ্রাস পায় এবং সেগ্রিগেশন (Segregation) ও ব্লিডিং (Bleeding) হওয়ার ঝুঁকি বহুগুণ বেড়ে যায়।"
  },
  {
    question: "Singly Reinforced Beam এবং Doubly Reinforced Beam এর মাঝে প্রধান কাঠামোগত পার্থক্য কী?",
    sampleAnswerKeywords: ["compression", "tension", "রড", "উভয়", "চাপ", "টান", "বিম"],
    correctExplanation: "Singly Reinforced Beam-এ রিবার শুধুমাত্র টেনশন জোনে (সাধারণত নিচের দিকে) ব্যবহার করা হয়। আর Doubly Reinforced Beam-এ অধিক লোড নেওয়ার জন্য টেনশন এবং কম্প্রেশন উভয় জোনেই প্রধান রড ব্যবহার করা হয়।"
  },
  {
    question: "মৃত্তিকা প্রকৌশল বা Geotechnical Engineering এ সিভ অ্যানালাইসিস (Sieve Analysis) প্রক্রিয়ার উদ্দেশ্য কী?",
    sampleAnswerKeywords: ["grain size", "কণার আকার", "বালি", "classification", "শ্রেণীবিন্যাস", "সিভ"],
    correctExplanation: "সিভ অ্যানালাইসিসের মাধ্যমে মাটির কণার আকার বন্টন বা Particle Size Distribution নির্ণয় করা হয়। এর মাধ্যমে মাটিকে ওয়েল-গ্রেডেড বা পুওরলি-গ্রেডেড হিসেবে চিহ্নিত করে মাটির ভারবহন ক্ষমতা ধারণা করা যায়।"
  },
  {
    question: "১ ব্যাগ সিমেন্টের ওজন কত কেজি এবং এর নির্দিষ্ট আয়তন কত সিএফটি (CFT)?",
    sampleAnswerKeywords: ["50", "1.25", "কেজি", "আয়তন", "সিএফটি", "cft", "kg"],
    correctExplanation: "১ ব্যাগ সিমেন্টের ওজন ৫০ কেজি (50 kg) এবং এর নির্দিষ্ট আয়তন প্রায় ১.২৫ সিএফটি (1.25 CFT) বা ০.০৩৪৭ ঘনমিটার।"
  },
  {
    question: "কংক্রিট ঢালাইয়ের পর মধুচক্র বা Honeycombing কেন সৃষ্টি হয় এবং তা প্রতিরোধের প্রধান উপায় কী?",
    sampleAnswerKeywords: ["ভয়েড", "হানিকম্ব", "কম্প্যাকশন", "ভাইব্রেটর", "ফাঁকা", "হানি কোম্ব"],
    correctExplanation: "পর্যাপ্ত ভাইব্রেশন বা কম্প্যাকশন না করা, শাটরিংয়ে লিক থাকা, এবং খুব ঘন রিবারের ফাঁকে বড় খোয়া আটকে যাওয়ার কারণে হানিকম্ব বা মধুচক্র সৃষ্টি হয়। এটি রোধ করতে সঠিক আকারের খোয়া নির্বাচন, লিক-প্রুফ ফরমা এবং সঠিক ভাইব্রেটর ব্যবহার করতে হবে।"
  },
  {
    question: "কংক্রিটের সেগ্রিগেশন (Segregation) এবং ব্লিডিং (Bleeding) বলতে কী বোঝায়?",
    sampleAnswerKeywords: ["আলাদা", "পানি উপরে", "সেগ্রিগেশন", "ব্লিডিং", "পৃথক", "রস"],
    correctExplanation: "কংক্রিটের উপাদানগুলো (সিমেন্ট, বালি, পাথর) একে অপরের থেকে আলাদা হয়ে যাওয়াকে Segregation বলে। আর কাস্টিংয়ের পর কংক্রিটের উপরিভাগে অতিরিক্ত পানি ও সিমেন্টের পাতলা স্তর উঠে আসাকে Bleeding বলে। উভয়ই কংক্রিটের শক্তি হ্রাস করে।"
  },
  {
    question: "মাঠ পর্যায়ে (On-site Field Test) একটি ভালো মানের ইটের সনাক্তকরণের প্রধান কয়েকটি উপায় কী কী?",
    sampleAnswerKeywords: ["টি শব্দ", "ধাতব", "লাল", "টি আকার", "নখ দিয়ে", "লবণ"],
    correctExplanation: "১. দুটি ইট দিয়ে আঘাত করলে ধাতব বা টীং টীং (T-sound) শব্দ হবে। ২. এর আকৃতি সুসম ও ধারগুলো তীক্ষ্ণ হবে। ৩. নখের আঁচড়ে কোনো দাগ পড়বে না। ৪. ২৪ ঘণ্টা পানিতে ডোবালে এটি নিজের ওজনের ১৫-২০% এর বেশি পানি শোষণ করবে না।"
  },
  {
    question: "What is Marshall Mix Design in pavement engineering, and what is its main purpose?",
    sampleAnswerKeywords: ["marshall", "bituminous", "asphalt", "stability", "flow", "voids", "রাস্তা"],
    correctExplanation: "Marshall Mix Design is used to determine the optimum binder content (asphalt/bitumen) for bituminous paving mixtures. It maximizes pavement stability, durability, and resistance to permanent deformation while maintaining appropriate air voids and flow."
  },
  {
    question: "সিভিল স্ট্রাকচারে R.C.C এবং P.C.C এর পূর্ণরূপ কী এবং মৌলিক পার্থক্য কী?",
    sampleAnswerKeywords: ["reinforced", "plain", "রড", "স্টীল", "আরসিসি", "পিসিসি"],
    correctExplanation: "R.C.C এর পূর্ণরূপ Reinforced Cement Concrete (রড বা স্টীল রিবার যুক্ত কংক্রিট) এবং P.C.C এর পূর্ণরূপ Plain Cement Concrete (রডবিহীন সাধারণ কংক্রিট)। R.C.C টেনশন এবং কম্প্রেশন উভয় লোড নিতে পারে, কিন্তু P.C.C শুধুমাত্র কম্প্রেশন লোড প্রতিরোধ করতে সক্ষম।"
  },
  {
    question: "সেপটিক ট্যাংকের ভেতরে বাফেল ওয়াল (Baffle Wall) ব্যবহারের কারণ এবং গুরুত্ব কী?",
    sampleAnswerKeywords: ["বাফেল", "baffle", "গতি", "তরল", "সলিড", "চৌবাচ্চা"],
    correctExplanation: "বাফেল ওয়াল ইনলেট পাইপ দিয়ে আসা বর্জ্যের সরাসরি প্রবাহের গতি হ্রাস করে এবং মল বা সলিড পদার্থকে পানির উপরিভাগে ভেসে থাকা ফেনা ও তলানির সাথে সুন্দরভাবে বিভক্ত হতে সাহায্য করে, যাতে সরাসরি আউটলেট পাইপ দিয়ে বর্জ্য নির্গত না হয়।"
  },
  {
    question: "সার্ভেয়িং-এ বেঞ্চ মার্ক (Bench Mark - BM) বলতে কী বোঝায় এবং এর রেফারেন্স কী?",
    sampleAnswerKeywords: ["bench mark", "রেফারেন্স", "উচ্চতা", "এমএসএল", "msl", "সমুদ্র"],
    correctExplanation: "বেঞ্চ মার্ক (BM) হলো অত্যন্ত সুনির্দিষ্টভাবে জানা কোনো বিন্দুর এলিভেশন বা উচ্চতা, যা অন্য কোনো বিন্দুর লেভেলিংয়ের জন্য রেফারেন্স বা ভিত্তি হিসেবে ব্যবহৃত হয়। সাধারণত সমুদ্র সমতল (Mean Sea Level) থেকে এর স্ট্যান্ডার্ড উচ্চতা পরিমাপ করা হয়।"
  },
  {
    question: "কংক্রিটের ক্যারেক্টারিস্টিক স্ট্রেন্থ (Characteristic Compressive Strength - f'c) বলতে কী বোঝায়?",
    sampleAnswerKeywords: ["৫%", "5%", "২৮ দিন", "কম্প্রেসিভ", "শক্তি", "f'c"],
    correctExplanation: "ক্যারেক্টারিস্টিক স্ট্রেন্থ বলতে কংক্রিটের সেই ধারণক্ষমতাকে বোঝায় যার নিচে ২৮ দিন কিউরিংয়ের পর পরীক্ষাকৃত নমুনার (Cylinder or Cube) ৫% এর বেশি ফেল বা ব্যর্থ হওয়ার আশঙ্কা থাকে না।"
  },
  {
    question: "ডি-পি-সি (DPC - Damp Proof Course) কী এবং একটি আবাসিক বিল্ডিংয়ে এর প্রয়োজনীয়তা ব্যাখ্যা করুন।",
    sampleAnswerKeywords: ["dpc", "ডিপিসি", "আর্দ্রতা", "নোনা", "মেঝে", "ড্যাম্প"],
    correctExplanation: "DPC বা ড্যাম্প প্রুফ কোর্স হলো প্লিন্থ লেভেলে ১-১.৫ ইঞ্চি পুরুত্বের জল-অভেদ্য রাসায়নিক স্তর যা মাটির নিচে ভিত্তি থেকে আর্দ্রতা বা কৈশিকতা (Capillary matching) প্রক্রিয়ায় দেয়ালে উঠে আসা নোনা ও ভেজা ভাব প্রতিরোধ করে দেয়াল সুরক্ষিত রাখে।"
  },
  {
    question: "কলামের রিং বা টাই রড (Tie Rod) এবং বীমের রিং বা স্টারাপ (Stirrup) এর মূল কাজ কী?",
    sampleAnswerKeywords: ["বকলিং", "শেয়ার", "বাঁধতে", "কলাম", "ভীম", "রিং"],
    correctExplanation: "কলামের টাই রড প্রধান রডগুলোকে সোজা রাখতে ধরে রাখে এবং বকলিং (Buckling) প্রতিরোধ করে। অন্যদিকে বীমের স্টারাপ প্রধান রডের স্থান সঠিক রাখে এবং লোডের কারণে তৈরি সিয়ার বা শেয়ার স্ট্রেস (Shear force) ও টর্শন প্রতিরোধ করে।"
  },
  {
    question: "হাইড্রেডেশন অব সিমেন্ট (Hydration of Cement) বা সিমেন্টের জলাযোজন বলতে কী বোঝায়?",
    sampleAnswerKeywords: ["রাসায়নিক", "তাপ", "পানি ও সিমেন্ট", "বিক্রিয়া", "কঠিন", "হাইড্রেশন"],
    correctExplanation: "সিমেন্টের সাথে পানির মিশ্রণ করা মাত্রই যে জট পাকানো রাসায়নিক বিক্রিয়া শুরু হয় যার ফলে কংক্রিট আস্তে আস্তে জমাট বেঁধে শক্ত পাথর সদৃশ রূপ ধারণ করে এবং প্রচুর পরিমাণে তাপ উৎপন্ন করে, তাকে হাইড্রেশন অব সিমেন্ট বলা হয়।"
  },
  {
    question: "একটি ফার্স্ট ক্লাস বা প্রথম শ্রেণীর ইটের পরিমাপ (Standard Size) মশলা ছাড়া ও মশলাসহ কত ইঞ্চি?",
    sampleAnswerKeywords: ["৯.৫", "৪.৫", "২.৭৫", "১০", "৫", "৩", "ইঞ্চি"],
    correctExplanation: "মশলা ছাড়া একটি আদর্শ ইটের পরিমাপ ৯.৫ ইঞ্চি × ৪.৫ ইঞ্চি × ২.৭৫ ইঞ্চি (৯.৫”×৪.৫”×২.৭৫”)। এবং মশলাসহ জয়েন্ট যুক্ত করার পর আকার দাঁড়ায় ১০ ইঞ্চি × ৫ ইঞ্চি × ৩ ইঞ্চি।"
  },
  {
    question: "মাটির বিয়ারিং ক্যাপাসিটি (Bearing Capacity) বা ভারবহন ক্ষমতা বৃদ্ধির প্রধান কয়েকটি প্রকৌশলগত পদ্ধতি কী কী?",
    sampleAnswerKeywords: ["কম্প্যাকশন", "পাইলিং", "পরিবর্তন", "রড", "স্ট্যাবিলাইজেশন"],
    correctExplanation: "মাটির সহনশীল ক্ষমতা বাড়াতে ১. মেকানিক্যাল কম্প্যাকশন করা যায়, ২. মাটির নিচে পাইলিং (Piling) ব্যবহার করা যায়, ৩. দুর্বল মাটি পরিবর্তন করে ভালো বালি দিয়ে ভরাট করা যায়, এবং ৪. কেমিক্যাল বা সিমেন্ট ইনজেকশন/গ্রাউটিং করা যায়।"
  },
  {
    question: "রাস্তার বাক বা কার্ভে ‘সুপার এলিভেশন’ (Super Elevation) বা ব্যাংকিং ব্যবহারের কারণ কী?",
    sampleAnswerKeywords: ["সেন্ট্রিফিউগাল", "ছিটকে", "বাইরের", "উঁচু", "গতি", "বাঁক"],
    correctExplanation: "রাস্তার বাঁকগুলোতে চলন্ত যানবাহন যাতে সেন্ট্রিফিউগাল ফোর্স বা কেন্দ্রাতিগ বলের কারণে বাইরের দিকে ছিটকে বা উল্টে না যায়, সেজন্য রাস্তার ভেতরের প্রান্তের তুলনায় বাইরের প্রান্তকে ক্রমান্বয়ে ঢালু ও উঁচুতে তৈরি করাকে সুপার এলিভেশন বলে।"
  },
  {
    question: "What is a Shear Wall in a high-rise building, and why is it essential?",
    sampleAnswerKeywords: ["shear wall", "lateral", "wind", "earthquake", "ഭൂകമ്പം", "বাতাস", "ঝড়"],
    correctExplanation: "A Shear Wall is a structural member designed to resist horizontal or lateral forces such as wind forces and earthquake/seismic loads. It provides stiffness and prevent high-rise concrete structures from swaying or getting damaged sideways."
  },
  {
    question: "কাদামাটি (Clayey Soil) এর ক্ষেত্রে বহুতল ভবনের জন্য কোন ধরণের ফাউন্ডেশন সবচেয়ে উপযুক্ত ও নিরাপদ?",
    sampleAnswerKeywords: ["raft", "pile", "ম্যাট", "রাফট", "পাইলিং", "গভীর"],
    correctExplanation: "কাদামাটির ভারবহন শক্তি কম ও সংকোচনশীলতা বেশি হওয়ায় দীর্ঘ বা বহু তলা ভবনের জন্য গভীর রাজত্ব তথা পাইলিং (Pile Foundation) অথবা মাঝারি ও হালকা স্ট্রাকচারের জন্য ম্যাট/রাফট ফাউন্ডেশন (Raft/Mat Foundation) সবচেয়ে উপযুক্ত।"
  },
  {
    question: "ইটের উপরিভাগে সাদা পাউডারের মতো লবণাক্ত স্তর দেখা যাওয়ার ঘটনাটিকে কী বলে? এর কারণ ও সমাধান কী?",
    sampleAnswerKeywords: ["efflorescence", "এ ফ্লোরেসেন্স", "লবণ", "সাদা", "পানি"],
    correctExplanation: "এই সাদা লবণের আস্তরণ পড়াকে Efflorescence (লোনা ধরা) বলে। ইট তৈরিতে ব্যবহৃত মাটিতে ক্ষার বা দ্রবণীয় ক্লোরাইড লবণের পরিমাণ বেশি থাকলে এবং ইটের ভেতর আর্দ্রতার কারণে এই লবণ বাইরে চলে আসে। ইট ব্যবহারের পূর্বে ভালো ধুয়ে সঠিক প্লাস্টারিং নিশ্চিত করতে হবে।"
  },
  {
    question: "কনক্রিটের ওয়াটার-সিমেন্ট রেশিও (Water-Cement Ratio) কীভাবে কংক্রিটের শক্তি নিয়ন্ত্রণ করে?",
    sampleAnswerKeywords: ["অনুপাত", "শক্তি", "পানি", "সুত্র", "হ্রাস", "বাড়লে", "কমে"],
    correctExplanation: "আব্রামের সুত্রানুযায়ী ওয়াটার-সিমেন্ট অনুপাত যত কম হবে, কংক্রিটের আলটিমেট কম্প্রেসিভ স্ট্রেন্থ তত বেশি হবে। তবে অনুপাত খুব কমিয়ে দিলে ওয়ার্কবিলিটি কমে যায়, তাই লিমিটের ভেতরে পানি ও সিমেন্টের ভারসাম্য অক্ষুণ্ণ রাখতে হয়।"
  },
  {
    question: "জলাধার বা ওয়াটার রিটেইনিং আরসিসি স্টাকচারের কনস্ট্রাকশন জয়েন্টে ওয়াটার স্টপার (Water Stopper) ব্যবহারের ভূমিকা কী?",
    sampleAnswerKeywords: ["leakage", "লিক", "ওয়াটার স্টপার", "stopper", "পানি", "জয়েন্ট"],
    correctExplanation: "কনস্ট্রাকশন জয়েন্টগুলোতে নতুন ও পুরাতন ঢালাইয়ের সংযোগস্থল দিয়ে যাতে পানি কোনোভাবেই চুইয়ে লিক (Leakage) হতে না পারে, সেজন্য পিভিসি বা মেটালের তৈরি পাতলা স্ট্রিপ ব্যবহার করা হয় যাকে 'Water Stopper' বা ওয়াটার স্টপার বলে।"
  },
  {
    question: "ভূপৃষ্ঠের মানচিত্র অঙ্কনে সার্ভেয়িং-এর কনট্যুর লাইন (Contour Line) বলতে কী বোঝায়?",
    sampleAnswerKeywords: ["contour", "কনট্যুর", "উচ্চতা", "সমান", "কাल्पनिक"],
    correctExplanation: "ভূপৃষ্ঠের যে সকল বিন্দুর এলিভেশন বা গড় উচ্চতা সমান, মানচিত্রে অঙ্কিত সেই সমান উচ্চতাসম্পন্ন বিন্দুগুলোকে সংযোগকারী কাল্পনিক রেখাসমূহকে কনট্যুর লাইন (Contour Line) বলা হয়।"
  },
  {
    question: "রিইনফোর্সমেন্ট বা রডের ডেভেলপমেন্ট লেন্থ (Development Length - Ld) বলতে কী বোঝায়?",
    sampleAnswerKeywords: ["development", "বন্ড", "ধরে রাখা", "টান", "রড", "কংক্রিট"],
    correctExplanation: "রডের ওপর আগত টান বা কম্প্রেশন ফোর্স যাতে কংক্রিটের ভেতরে বন্ড বা বাধন (Bond stress) তৈরির মাধ্যমে সম্পূর্ণভাবে কংক্রিটে ট্রান্সফার হতে পারে, সেজন্য রডকে সাপোর্টের ভেতরের দিকে যতটুকু বাড়িয়ে প্রবেশ করানো হয় তাকে ডেভেলপমেন্ট লেন্থ বলে।"
  },
  {
    question: "রেডি মিক্স কংক্রিটে (RMC) কেন রিটার্ডার (Retarder) বা জমানো ধীরকারী রাসায়নিক এজেন্ট যোগ করা হয়?",
    sampleAnswerKeywords: ["retarder", "রিটার্ডার", "ধীরে", "পরিবহন", "সময়", "জমাট"],
    correctExplanation: "রেডি মিক্স কংক্রিট কারখানা থেকে গাড়িতে করে দূরবর্তী কোনো প্রজেক্ট সাইটে পৌঁছাতে পরিবহনের সময়ের প্রয়োজন হয়। কংক্রিট যেন পথিমধ্যে বা পরিবহনে অকালেই জমাট বেঁধে না যায়, সেজন্য রিটার্ডিং কেমিক্যাল ব্যবহার করে এর ইনিশিয়াল সেটিংস টাইম কমানো বা দীর্ঘায়িত করা হয়।"
  },
  {
    question: "বিটুমিন (Bitumen) এবং আলকাতরা বা টার (Coal Tar) এর মধ্যে প্রধান পাথর্ক্য কী?",
    sampleAnswerKeywords: ["বিটুমিন", "আলকাতরা", "কয়লা", "পেট্রোলিয়াম", "রাস্তা", "tar"],
    correctExplanation: "বিটুমিন হলো অপরিশোধিত খনিজ তেল বা পেট্রোলিয়ামের আংশিক পাতনের প্রাকৃতিক অবশেষ এবং এটি কালোবর্ণের হয়। অন্যদিকে, আলকাতরা বা কোল টার হলো কয়লা বা কাঠের অন্তর্ধুম পাতনের উপজাত (Byproduct)। বিটুমিন দীর্ঘস্থায়ী এবং রাস্তা তৈরিতে সর্বোত্তম।"
  },
  {
    question: "কংক্রিট ঢালাইয়ের সময় সর্বোচ্চ কত উচ্চতা থেকে কংক্রিটের ফ্রি-ফল (Free Fall) বা ফেলে কাস্টিং করা নির্ধারিত?",
    sampleAnswerKeywords: ["1.5", "১.৫", "উচ্চতা", "সেগ্রিগেশন", "মিটার"],
    correctExplanation: "আদর্শ মান অনুযায়ী সর্বোচ্চ ১.৫ মিটার (বা প্রায় ৫ ফুট) উচ্চতার বেশি ওপর থেকে সরাসরি কংক্রিট ঢেলে ফেলা বা ড্রপ করা নিষিদ্ধ। এর চেয়ে বেশি উচ্চতা থেকে ফেললে কংক্রিটের সেগ্রিগেশন (Segregation) ঘটে উপাদানগুলো পৃথক হয়ে যায়।"
  },
  {
    question: "ইঞ্জিনিয়ারিং প্রাক্কলন বা Estimating and Costing এর মূল উদ্দেশ্য আমাদের কী সুবিধা প্রদান করে?",
    sampleAnswerKeywords: ["বাজেট", "পরিমাণ", "ব্যয়", "খরচ", "উপাদান", "অগ্রিম"],
    correctExplanation: "প্রাক্কলনের মূল উদ্দেশ্য হলো কোনো কাঠামো তৈরির কাজ শুরু করার পূর্বে সেই কাজে কী কী উপকরণ লাগবে, তাদের সঠিক পরিমাণ কত এবং মোট কত অর্থ ব্যয় বা বাজেট হতে পারে তা অগ্রিম ও শারীরিকভাবে নিখুঁত অনুমান করা।"
  }
];

export default function App() {
  // Tabs State
  const [activeTab, setActiveTab] = useState<"study_desk" | "estimation" | "autocad" | "viva_board" | "office_projects">("study_desk");
  
  // App-wide Active Study Mode
  const [activeMode, setActiveMode] = useState<StudyMode>("General Mode");
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "আসসালামু আলাইকুম। **RPI Civil Master AI Assistant**-এ আপনাকে স্বাগতম।\n\nআমি আপনাকে সিভিল ইঞ্জিনিয়ারিং প্রাক্কলন (Estimation / BOQ), AutoCAD কমান্ডস, চাকুরির ভাইভা প্রস্তুতি ও সেমিস্টার ফাইনালের গাণিতিক সমস্যা সমাধানে পেশাদার সহায়তা প্রদানের জন্য প্রস্তুত। কোনো প্রশ্ন জিজ্ঞাসা করতে নিচে টাইপ করুন।\n\n*Created by:* **MD Mushfiqur Rahman** (Civil 2024-25), Rajshahi Polytechnic Institute.",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Upload Attachment states
  const [attachment, setAttachment] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AutoCAD Search Filter
  const [cadSearch, setCadSearch] = useState("");
  const [cadCategoryFilter, setCadCategoryFilter] = useState<string>("All");

  // Project & Office Application States for Tab 5
  const [projectSubTab, setProjectSubTab] = useState<"bbs" | "word" | "supervisor">("bbs");
  const [bbsDiameter, setBbsDiameter] = useState<number>(16);
  const [bbsLength, setBbsLength] = useState<number>(12);
  const [bbsQty, setBbsQty] = useState<number>(5);
  const [bbsUnit, setBbsUnit] = useState<"m" | "ft">("m");
  const [wordMarginLeft, setWordMarginLeft] = useState<number>(1.5);
  const [wordMarginOthers, setWordMarginOthers] = useState<number>(1.0);
  const [wordLineSpacing, setLineSpacing] = useState<string>("1.5");
  const [wordFontSize, setWordFontSize] = useState<number>(12);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [projectMilestones, setProjectMilestones] = useState([
    { id: 1, text: "Literature Review & Topic Selection (লিটারেচার রিভিউ)", done: true },
    { id: 2, text: "Materials Collection & Sieve Analysis (বালির এফএম বের করা)", done: false },
    { id: 3, text: "Concrete Mix Design (কনক্রিট মিক্স ডিজাইন অনুপাত নির্ধারণ)", done: false },
    { id: 4, text: "Specimen Casting & Curing in Water Tank (কিউরিং প্রসেস)", done: false },
    { id: 5, text: "Compressive Strength Testing using UTM (ইউটিএম লোড টেস্ট)", done: false },
    { id: 6, text: "Report Writing & Final Presentation (থিসিস পেপার রাইটিং)", done: false },
  ]);

  // Interactive Mock Viva States
  const [vivaActive, setVivaActive] = useState(false);
  const [vivaIndex, setVivaIndex] = useState(0);
  const [vivaUserAnswer, setVivaUserAnswer] = useState("");
  const [vivaScore, setVivaScore] = useState(0);
  const [vivaLogs, setVivaLogs] = useState<Array<{ q: string; a: string; evaluation: "Excellent" | "Good" | "Needs Improvement"; feedback: string }>>([]);
  const [isEvaluatingViva, setIsEvaluatingViva] = useState(false);
  const [vivaShowGradeCard, setVivaShowGradeCard] = useState(false);
  const [currentVivaQuestions, setCurrentVivaQuestions] = useState<typeof OFFLINE_VIVA_BANK>(OFFLINE_VIVA_BANK.slice(0, 10));

  // Real Bengali & English Speech-to-Text Recognition states
  const [isListeningAnswer, setIsListeningAnswer] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"bn-BD" | "en-US">("bn-BD");
  const [voiceSupportError, setVoiceSupportError] = useState("");
  const recognitionRef = useRef<any>(null);
  const chatbotRecognitionRef = useRef<any>(null);

  // Voice Interaction Recording UI Animation Simulation (Microphone toggle)
  const [isRecording, setIsRecording] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState("");

  // Auto scroll references
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom immediately
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    // Secondary delayed scroll to lock position once KaTeX equation styling and layout finishes rendering in browser
    const scrollTimer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 120);

    return () => clearTimeout(scrollTimer);
  }, [messages, isSending]);

  // Adjust active mode based on Tab for cohesive UI experience
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab === "estimation") {
      setActiveMode("Estimation Mode");
    } else if (tab === "autocad") {
      setActiveMode("AutoCAD Mode");
    } else if (tab === "viva_board") {
      setActiveMode("Viva Mode");
    } else if (tab === "office_projects") {
      setActiveMode("Project Mode");
    } else {
      setActiveMode("General Mode");
    }
  };

  // Switch to Chat tab and immediately send a query
  const askAssistant = (query: string, modeOverride?: StudyMode) => {
    setActiveTab("study_desk");
    const targetMode = modeOverride || "General Mode";
    setActiveMode(targetMode);
    
    // Pass targetMode directly to avoid stale closures in React scheduled updates
    setTimeout(() => {
      handleSendChat(query, targetMode);
    }, 50);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        base64: reader.result as string,
        mimeType: file.type
      });
    };
    reader.onerror = () => {
      alert("ফাইলটি লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini API Server-Side Call
  const handleSendChat = async (textToSend?: string, modeOverride?: StudyMode) => {
    const currentMode = modeOverride || activeMode;
    const text = (textToSend || inputVal).trim();
    if (!text && !attachment) return;

    setIsSending(true);
    setInputVal("");

    // Add User Message local state
    const userMessageId = Math.random().toString();
    const newUserMsg: Message = {
      id: userMessageId,
      role: "user",
      content: text || "একটি ড্রয়িং ইমেজ আপলোড করেছেন।",
      timestamp: new Date(),
      mode: currentMode,
      attachmentName: attachment ? attachment.name : undefined,
      attachmentData: attachment ? attachment.base64 : undefined
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    // Keep memory of only last 12 messages to manage token count and payload speed
    const apiMessages = updatedMessages.slice(-12).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Reset current file attachment input preview
    const attachedDataToSend = attachment;
    setAttachment(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages,
          activeMode: currentMode,
          attachment: attachedDataToSend
        })
      });

      if (!response.ok) {
        throw new Error("সার্ভার রেসপন্স করতে ব্যর্থ হয়েছে। দয়া করে আপনার GEMINI_API_KEY কনফিগারেশন চেক করুন।");
      }

      const data = await response.json();
      
      const newBotMsg: Message = {
        id: Math.random().toString(),
        role: "model",
        content: data.reply || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।",
        timestamp: new Date(),
        mode: currentMode
      };

      setMessages(prev => [...prev, newBotMsg]);
    } catch (err: any) {
      console.error(err);
      
      // Detailed user fallback message with diagnostics if key is missing
      const errorBotMsg: Message = {
        id: Math.random().toString(),
        role: "model",
        content: `⚠️ **নেটওয়ার্ক সংযোগ বা এপিআই কী বিভ্রান্তি!** \n\n${err.message || "Gemini API ক্লাউড সংযোগ ব্যর্থ হয়েছে।"}\n\n**কীভাবে সমাধান করবেন:** \n১. ডানদিকের AI Studio Settings-এ আপনার \`GEMINI_API_KEY\` যুক্ত আছে কিনা তা নিশ্চিত করুন।\n২. আপনি চাইলে অফলাইন মডিউলসমূহ যেমন ইটের দেয়ালের হিসাব, ​​রড ওজন নিরূপণ এবং ড্রয়িং ড্যাশবোর্ড সম্পূর্ণ অফলাইনেই ব্যবহার করতে পারেন।`,
        timestamp: new Date(),
        mode: currentMode
      };
      setMessages(prev => [...prev, errorBotMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Real Voice Speach-To-Text Recognition for Chatbot
  const handleMicrophoneClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("আপনার ব্রাউজারে ভয়েস টাইপিং সাপোর্ট করে না। অনুগ্রহ করে গুগল ক্রোম (Google Chrome) ব্রাউজার ব্যবহার করুন বা পোর্টালের উপরে 'Open in New Tab' এ ক্লিক করে নতুন ট্যাবে খুলুন।");
      return;
    }

    if (isRecording) {
      if (chatbotRecognitionRef.current) {
        try {
          chatbotRecognitionRef.current.stop();
        } catch (e) {
          console.warn("Stopping chatbot speech non-fatal error:", e);
        }
      }
      setIsRecording(false);
      setSpeechFeedback("");
      return;
    }

    setSpeechFeedback("মাইক্রোফোন সংযোগ করা হচ্ছে...");
    try {
      const rec = new SpeechRecognition();
      // Set to false for extremely high reliability across devices, avoiding hangs in iframe environments
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "bn-BD";

      rec.onstart = () => {
        setIsRecording(true);
        setSpeechFeedback("🎙️ ভয়েস টাইপিং অন আছে... অনুগ্রহ করে বাংলা বা ইংরেজিতে প্রশ্নটি বলুন");
      };

      rec.onresult = (e: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInputVal(prev => {
            const trimmedPrev = prev.trim();
            return trimmedPrev ? trimmedPrev + " " + finalTranscript : finalTranscript;
          });
          setSpeechFeedback("🎙️ ভয়েস টাইপ হলো! আপনি চাইলে আরও বলতে পারেন...");
        } else if (interimTranscript) {
          setSpeechFeedback("🎤 শুনছি: " + interimTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Chatbot Voice Recognition Error:", e);
        if (e.error === "not-allowed") {
          setSpeechFeedback("⚠️ মাইক্রোফোন ব্যবহারের অনুমতি নেই! ব্রাউজারের Lock 🔒 আইকন থেকে Microphone 'Allow' করুন অথবা নতুন ট্যাবে ওপেন করুন।");
        } else if (e.error === "no-speech") {
          setSpeechFeedback("⚠️ কোনো আওয়াজ শোনা যায়নি! দয়া করে উচ্চস্বরে স্পষ্ট করে বলুন।");
        } else if (e.error === "network") {
          setSpeechFeedback("⚠️ নেটওয়ার্ক ক্রুটি! ইন্টারনেট সংযোগ চেক করুন।");
        } else {
          setSpeechFeedback(`⚠️ ভয়েস রিকগনিশন ক্রুটি: ${e.error || "unknown"}`);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        // Do not instantly wipe the feedback if there is an error warning, so the student can read it
        setTimeout(() => {
          setSpeechFeedback(prev => prev && prev.startsWith("🎙️") ? "" : prev);
        }, 3000);
      };

      chatbotRecognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setIsRecording(false);
      setSpeechFeedback("⚠️ ভয়েস টাইপিং ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে।");
    }
  };

  // Web Speech API - Speech to Text: Voice input for typing Bengali or English answers
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceSupportError("আপনার ব্রাউজারে voice typing বা Speech-to-Text সাপোর্ট করে না। অনুগ্রহ করে গুগল ক্রোম ব্রাউজার ব্যবহার করুন।");
      return;
    }

    if (isListeningAnswer) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Stopping recognition non-fatal exception:", e);
        }
      }
      setIsListeningAnswer(false);
      return;
    }

    setVoiceSupportError("");
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = voiceLang; // dynamically set to 'bn-BD' or 'en-US'

      rec.onstart = () => {
        setIsListeningAnswer(true);
      };

      rec.onresult = (e: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }
        if (finalTranscript || interimTranscript) {
          setVivaUserAnswer(finalTranscript + interimTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setVoiceSupportError("মাইক্রোফোন অনুমতি মেলেনি। অনুগ্রহ করে উপরের 'New Tab' লিংকে অথবা নতুন ট্যাবে অ্যাপটি খুলুন এবং মাইক্রোফোনের অনুমতি দিন।");
        } else if (e.error === "no-speech") {
          setVoiceSupportError("কোনো আওয়াজ সনাক্ত করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        } else {
          setVoiceSupportError(`ভয়েস ইনপুট এরর: ${e.error}`);
        }
        setIsListeningAnswer(false);
      };

      rec.onend = () => {
        setIsListeningAnswer(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setVoiceSupportError("ভয়েস ইনপুট সার্ভিস চালু করতে ব্যর্থ হয়েছে।");
      setIsListeningAnswer(false);
    }
  };

  // Stop voice speech input when changing questions or starting new sessions
  useEffect(() => {
    if (isListeningAnswer && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListeningAnswer(false);
    }
    setVoiceSupportError("");
  }, [vivaIndex, vivaActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (chatbotRecognitionRef.current) {
        try {
          chatbotRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Offline Viva Evaluation Engine
  const startVivaSession = () => {
    // Shuffle the entire pool of 31 questions randomly (non-sequentially)
    const shuffled = [...OFFLINE_VIVA_BANK].sort(() => Math.random() - 0.5);
    // Select a fresh set of 10 random questions for this session
    setCurrentVivaQuestions(shuffled.slice(0, 10));
    setVivaActive(true);
    setVivaIndex(0);
    setVivaUserAnswer("");
    setVivaScore(0);
    setVivaLogs([]);
    setVivaShowGradeCard(false);
  };

  const handleVivaSubmitAnswer = () => {
    if (!vivaUserAnswer.trim()) return;

    setIsEvaluatingViva(true);
    const currentQData = currentVivaQuestions[vivaIndex] || OFFLINE_VIVA_BANK[0];
    
    setTimeout(() => {
      // Basic key match analysis for immersive grading
      const answerLower = vivaUserAnswer.toLowerCase();
      let matches = 0;
      currentQData.sampleAnswerKeywords.forEach(kw => {
        if (answerLower.includes(kw.toLowerCase())) {
          matches++;
        }
      });

      let evaluation: "Excellent" | "Good" | "Needs Improvement" = "Needs Improvement";
      let pointsAwarded = 0;

      // Score per question out of 10 (Total 100 for 10 questions)
      if (matches >= 3) {
        evaluation = "Excellent";
        pointsAwarded = 10;
      } else if (matches >= 1) {
        evaluation = "Good";
        pointsAwarded = 6;
      } else {
        evaluation = "Needs Improvement";
        pointsAwarded = 2;
      }

      setVivaScore(prev => prev + pointsAwarded);
      
      const newLog = {
        q: currentQData.question,
        a: vivaUserAnswer,
        evaluation,
        feedback: currentQData.correctExplanation
      };

      setVivaLogs(prev => [...prev, newLog]);
      setIsEvaluatingViva(false);

      if (vivaIndex + 1 < currentVivaQuestions.length) {
        setVivaIndex(prev => prev + 1);
        setVivaUserAnswer("");
      } else {
        // Show grade card
        setVivaShowGradeCard(true);
      }
    }, 1000);
  };

  const skipVivaQuestion = () => {
    const currentQData = currentVivaQuestions[vivaIndex] || OFFLINE_VIVA_BANK[0];
    const newLog = {
      q: currentQData.question,
      a: "[এড়িয়ে যাওয়া হয়েছে]",
      evaluation: "Needs Improvement" as const,
      feedback: currentQData.correctExplanation
    };
    setVivaLogs(prev => [...prev, newLog]);
    
    if (vivaIndex + 1 < currentVivaQuestions.length) {
      setVivaIndex(prev => prev + 1);
      setVivaUserAnswer("");
    } else {
      setVivaShowGradeCard(true);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] text-slate-800 font-sans overflow-hidden">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Navigation Sidebar */}
      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col shrink-0 border-r border-slate-900 shadow-xl transition-transform duration-300 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 h-screen`}>
        <div className="p-4 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 px-2 bg-blue-600 rounded text-caps font-extrabold text-[11px] shadow-sm tracking-wide">
              RPI
            </span>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white uppercase leading-none">
                RPI CivilGPT
              </h1>
              <p className="text-[9px] text-blue-400 font-mono tracking-wider mt-0.5">
                RAJSHAHI POLYTECHNIC
              </p>
            </div>
          </div>

          {/* Sidebar Close Button for Mobile Screens */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="মেনু বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Links */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          <span className="text-[9px] font-bold text-slate-500 uppercase px-2.5 tracking-wider block mb-1.5">
            মূল ড্যাশবোর্ড (Main Desk)
          </span>

          <button
            onClick={() => handleTabChange("study_desk")}
            className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-left text-xs font-semibold transition-all duration-150 ${
              activeTab === "study_desk"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>সিভিল অ্যাসিস্ট্যান্স ডেস্ক</span>
          </button>

          <button
            onClick={() => handleTabChange("estimation")}
            className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-left text-xs font-semibold transition-all duration-150 ${
              activeTab === "estimation"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>প্রাক্কলন ও ম্যাটেরিয়াল হিসাব</span>
          </button>

          <button
            onClick={() => handleTabChange("autocad")}
            className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-left text-xs font-semibold transition-all duration-150 ${
              activeTab === "autocad"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>AutoCAD কোড ও অবজেক্ট গাইড</span>
          </button>

          <button
            onClick={() => handleTabChange("viva_board")}
            className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-left text-xs font-semibold transition-all duration-150 ${
              activeTab === "viva_board"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>মক ভাইভা বোর্ড সিমুলেটর</span>
          </button>

          <button
            onClick={() => handleTabChange("office_projects")}
            className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-left text-xs font-semibold transition-all duration-150 ${
              activeTab === "office_projects"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>MS Office & প্রজেক্ট গাইড</span>
          </button>

         </nav>

        {/* Civil Student Portfolio profile bottom footer */}
        <div className="p-3 border-t border-slate-850 bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-7.5 h-7.5 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shadow-inner shrink-0 text-[11px]">
              MR
            </div>
            <div className="text-[11px] truncate leading-tight">
              <div className="font-semibold text-slate-200">MD Mushfiqur Rahman</div>
              <div className="text-[9px] text-blue-400 truncate opacity-90">Creator | Civil 2024-25</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Section */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-2 text-sm text-slate-500 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg mr-2 shrink-0"
              title="মেনু খুলুন"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="hidden sm:inline text-slate-400">RPI সিভিল লাইভ</span>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="font-bold text-slate-800 uppercase tracking-tight text-xs md:text-sm truncate">
              {activeTab === "study_desk" && "AI Assistant (বাংলা)"}
              {activeTab === "estimation" && "Estimation & BOQ"}
              {activeTab === "autocad" && "AutoCAD Drafting references"}
              {activeTab === "viva_board" && "Board Examination Viva"}
              {activeTab === "office_projects" && "Project Management & Office Guides"}
            </span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
            {/* Active Mode Selector Dropdown */}
            <div className="relative">
              <button
                id="header-mode-selector-btn"
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className="flex items-center space-x-1.5 md:space-x-2 px-2 py-1 md:px-3 md:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] md:text-xs font-semibold text-slate-700 transition-all pointer-events-auto"
                title="অধ্যয়ন মোড পরিবর্তন করুন"
              >
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>মোড: {activeMode.replace(" Mode", "")}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {modeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setModeDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1 border-b border-slate-100 mb-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      মোড পরিবর্তন করুন
                    </div>
                    {(
                      [
                        "General Mode",
                        "Viva Mode",
                        "Estimation Mode",
                        "AutoCAD Mode",
                        "Math Mode",
                        "Project Mode"
                      ] as StudyMode[]
                    ).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setActiveMode(mode);
                          if (mode === "Viva Mode") setActiveTab("viva_board");
                          else if (mode === "Estimation Mode") setActiveTab("estimation");
                          else if (mode === "AutoCAD Mode") setActiveTab("autocad");
                          else if (mode === "Project Mode") setActiveTab("office_projects");
                          else setActiveTab("study_desk");
                          setModeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-slate-50 text-left ${
                          activeMode === mode
                            ? "text-blue-600 font-semibold bg-blue-50"
                            : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${
                              activeMode === mode ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          ></span>
                          <span>{mode}</span>
                        </div>
                        {activeMode === mode && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100 shadow-sm shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>BNBC Ready</span>
            </div>
            <div className="hidden sm:block text-[11px] text-slate-400 shrink-0">
              Time (UTC): <span className="font-mono text-slate-600 font-bold">2026-06-03</span>
            </div>
          </div>
        </header>

        {/* Content View Routing Area */}
        <div className={`flex-grow overflow-hidden ${activeTab === "study_desk" ? "p-0" : "p-6"} gap-6 flex`}>
          
          {/* TAB 1: INTERACTIVE AI STUDY DESK & COMPREHENSIVE CHAT FEED */}
          {activeTab === "study_desk" && (
            <div className="flex-1 flex flex-col lg:flex-row gap-0 h-full overflow-hidden">
              {/* Chat container */}
              <div className="flex-1 flex flex-col bg-white rounded-none border-0 overflow-hidden h-full">
                {/* Chat feed list */}
                <div 
                  ref={chatContainerRef}
                  className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/50"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-2.5 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {msg.role === "model" ? (
                          <>
                            <div className="w-6 h-6 rounded bg-slate-900 text-[10px] text-white flex items-center justify-center font-black">
                              AI
                            </div>
                            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                              RPI CivilGPT
                            </span>
                            {msg.mode && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                {msg.mode}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                              ডিপ্লোমা ইঞ্জিনিয়ার (শিক্ষার্থী)
                            </span>
                            <div className="w-6 h-6 rounded bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold">
                              ME
                            </div>
                          </>
                        )}
                      </div>

                      <div
                        className={`p-3 md:p-3.5 text-xs md:text-[13px] leading-relaxed rounded-2xl border ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white border-blue-500 rounded-tr-none shadow-md shadow-blue-500/10"
                            : "bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm"
                        }`}
                      >
                        {/* Preserve user-uploaded attachment information */}
                        {msg.attachmentName && (
                          <div className="mb-2 p-2 bg-black/10 rounded flex items-center gap-2 text-xs font-mono font-bold max-w-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>আপলোডকৃত ড্রয়িং: {msg.attachmentName}</span>
                          </div>
                        )}
                        {msg.attachmentData && (
                          <div className="mb-3 max-w-xs overflow-hidden rounded-lg border border-black/10 dark:border-white/15 shadow bg-white p-1">
                            <img
                              src={msg.attachmentData}
                              alt="Attachment preview"
                              className="max-h-[180px] w-full object-contain rounded"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        
                        {msg.role === "user" ? (
                          <p className="whitespace-pre-line text-left text-xs md:text-[13px] leading-relaxed">
                            {msg.content}
                          </p>
                        ) : (
                          <MarkdownAndMath content={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="mr-auto items-start max-w-[80%] flex flex-col space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded bg-slate-900 text-[10px] text-white flex items-center justify-center font-black animate-spin">
                          AI
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">
                          উত্তর তৈরি হচ্ছে... বালি, সিমেন্ট ও কাঠামোগত কোড বিশ্লেষণ করা হচ্ছে...
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 w-48 shadow-sm">
                        <div className="flex space-x-2 justify-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input action panels bar */}
                <div className="p-2 md:p-2.5 bg-white border-t border-slate-200">
                  {/* File Upload Attachment Preview overlay wrapper */}
                  {attachment && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 mb-2">
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-800">
                        <span className="p-1 bg-blue-200 rounded text-blue-800">IMAGE</span>
                        <span className="truncate max-w-xs">{attachment.name}</span>
                      </div>
                      <button
                        onClick={() => setAttachment(null)}
                        className="text-xs text-red-500 hover:underline font-bold px-1"
                      >
                        বাতিল করুন
                      </button>
                    </div>
                  )}

                  {/* Micro recording warning */}
                  {isRecording && (
                    <div className="text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-1.5 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                        {speechFeedback || "ভয়েস রেকর্ডার চালু আছে... দয়া করে প্রশ্ন বলুন"}
                      </span>
                      <button
                        onClick={() => setIsRecording(false)}
                        className="text-xs font-bold underline"
                      >
                        স্টপ
                      </button>
                    </div>
                  )}

                  {/* Main Input Text Field */}
                  <div className="flex items-center bg-[#F8FAFC] border border-slate-300 focus-within:border-blue-500 rounded-lg p-1.5 shadow-inner transition-colors">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="ড্রয়িং ফটো আপলোড"
                      className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                      placeholder="এখানে বাংলা বা ইংরেজিতে প্রশ্ন লিখুন..."
                      className="flex-1 px-3 py-1 text-xs md:text-sm text-slate-800 outline-none bg-transparent min-w-0"
                    />

                    {/* Real Voice Input for Chatbot */}
                    <button
                      onClick={handleMicrophoneClick}
                      title="কথা বলুন (ভয়েস টাইপিং)"
                      className={`p-1.5 rounded-md transition-all mr-1 ${
                        isRecording ? "bg-red-600 text-white animate-pulse" : "hover:bg-slate-250 text-slate-500"
                      } shrink-0`}
                    >
                      {isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleSendChat()}
                      className="bg-blue-600 hover:bg-blue-700 font-semibold text-white px-3.5 py-1.5 rounded-md text-xs transition-all shadow-md shadow-blue-600/10 flex items-center justify-center shrink-0"
                    >
                      <span className="hidden sm:inline">পাঠান</span>
                      <Send className="w-3.5 h-3.5 sm:ml-1.5 inline-block" />
                    </button>
                  </div>

                  {/* Micro Interaction suggestions tags */}
                  <div className="flex items-center mt-1.5 space-x-2 text-[10px] text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-500 shrink-0">
                      দ্রুত হেল্পারস:
                    </span>
                    <span className="flex gap-1.5 font-mono scrollbar-none overflow-x-auto whitespace-nowrap">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                        📷 ড্রয়িং স্পেক্স বিশ্লেষণ
                      </span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                        📄 ম্যাথমেটিকস মোড
                      </span>

                    </span>
                  </div>
                </div>
              </div>


            </div>
          )}

          {/* TAB 2: ADVANCED BOQ & ESTIMATION CENTRE */}
          {activeTab === "estimation" && (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-250 p-6 flex flex-col h-full overflow-y-auto">
              <div className="mb-5 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  নির্মাণ ম্যাটেরিয়াল কোয়ান্টিটি টেকঅফ ও প্রাক্কলন (Quantity Takeoff)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ভবন নির্মাণের স্ল্যাব/কংক্রিট ঢালাই, নিখুঁত ব্রিকওয়াল গাঁথুনি, দেয়ালের প্লাস্টারিং এবং আন্তর্জাতিক মানের রিবার ইউনিটের ওজন ও ভলিউম নির্ধারণ করুন।
                </p>
              </div>

              <div className="flex-1 overflow-visible">
                <EstimationSuite />
              </div>
            </div>
          )}

          {/* TAB 3: AUTOCAD COMMANDS DATABASE & BLUEPRINT SYMBOLS */}
          {activeTab === "autocad" && (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-250 p-6 flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
              {/* CAD command directory */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold text-slate-800">
                    AutoCAD ড্রাফটিং কম্যান্ড ও শর্টকাট সূচী
                  </h2>
                  <p className="text-xs text-slate-500">
                    পদক্ষেপভিত্তিক ড্রয়িং পদ্ধতি ও কমন ডাইমেনশনাল কমান্ডের ডেটাবেজ।
                  </p>
                </div>

                {/* Filter / Search block */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-250 rounded-lg px-3 py-1.5">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="কমান্ড বা শর্টকাট দিয়ে খুঁজুন (যেমন L, PL, H)..."
                      value={cadSearch}
                      onChange={(e) => setCadSearch(e.target.value)}
                      className="bg-transparent text-sm text-slate-800 focus:outline-none w-full"
                    />
                    {cadSearch && (
                      <button onClick={() => setCadSearch("")} className="text-xs text-slate-400 hover:text-slate-650">
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto">
                    {["All", "Draw", "Modify", "Dimension", "Format"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCadCategoryFilter(cat)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                          cadCategoryFilter === cat
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commands list catalog */}
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-150">
                  {AUTOCAD_COMMANDS.filter((cmd) => {
                    const matchSearch =
                      cmd.command.toLowerCase().includes(cadSearch.toLowerCase()) ||
                      cmd.shortcut.toLowerCase().includes(cadSearch.toLowerCase()) ||
                      cmd.descBangla.includes(cadSearch);
                    const matchCategory =
                      cadCategoryFilter === "All" || cmd.category === cadCategoryFilter;
                    return matchSearch && matchCategory;
                  }).map((cmd, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                            {cmd.shortcut}
                          </span>
                          <span className="text-sm font-extrabold text-slate-800 font-mono tracking-tight">{cmd.command}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium"><strong>বাংলা বিবরণ:</strong> {cmd.descBangla}</p>
                      <p className="text-[11px] text-slate-450 italic mt-0.5"><strong>English Description:</strong> {cmd.descEnglish}</p>
                      <div className="mt-2 bg-slate-50/80 rounded border border-slate-200 p-2 text-[10px] font-mono text-slate-650 flex items-center justify-between">
                        <span><strong>ধাপ:</strong> {cmd.useCase}</span>
                        <button 
                          onClick={() => setInputVal(`AutoCAD এ ${cmd.command} কম্যান্ড দিয়ে কীভাবে ড্রয়িং করব বিস্তারিত বলুন।`)}
                          className="text-blue-600 font-bold hover:underline shrink-0 ml-2"
                        >
                          বিশ্লেষণ করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AutoCAD Live Simulator Visual grid panel (Right side card) */}
              <div className="w-80 shrink-0 bg-slate-100 rounded-xl border border-slate-250 p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      AutoCAD স্ট্যান্ডার্ড গাইডস
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    বাংলাদেশে সিভিল কাজে সাধারণত নিচে বর্ণিত তিনটি ড্রয়িং স্ট্যান্ডার্ড সবচেয়ে বেশি অনুসৃত হয়:
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-350 transition-colors">
                      <div className="font-bold text-xs text-slate-800 font-mono">1. Architectural Plan Unit</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ইউনিট সেট করার সময়ে Precision ২ ঘরের জন্য Architectural টাইপ দেওয়া নিরাপদ।
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-350 transition-colors">
                      <div className="font-bold text-xs text-slate-800 font-mono">2. Dimension Style (D)</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        টেক্সটের উচ্চতা সর্বনিম্ন ৩ ইঞ্চি থেকে শুরু করে ড্রয়িং-স্কেলের অনুপাত অনুযায়ী বৃদ্ধি করতে হয়।
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-350 transition-colors">
                      <div className="font-bold text-xs text-slate-800 font-mono">3. Lay-outs & Standard layers</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        রড লেআউট বা কলাম লেআউটের জন্য ভিন্ন ভিন্ন ডাবল লেয়ার সেট মেইনটেইন করা বাঞ্ছনীয়।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#E2E8F0] rounded-lg border border-slate-300 text-xs">
                  <div className="font-semibold text-slate-755 mb-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>দ্রুত ড্রয়িং টিপস:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    AutoCAD-এ ড্রয়িং শুরুর আগে সর্বদা <span className="font-mono bg-white px-0.5">LIMITS</span> এবং <span className="font-mono bg-white px-0.5">ZOOM All</span> কম্যান্ড টাইপ করে ড্রইং স্ক্রিন সীমানা নির্ধারণ করে নেওয়া শ্রেয়।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPREHENSIVE VIVA BOARD SIMULATOR PANEL */}
          {activeTab === "viva_board" && (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-250 p-6 flex flex-col h-full overflow-y-auto">
              {/* Header Title */}
              <div className="mb-5 border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    🎓 রাজশাহী পলিটেকনিক সরকারি/বেসরকারি চাকুরীর মক ভাইভা বোর্ড
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    রাজশাহী পলিটেকনিকের অভিজ্ঞ সিভিল শিক্ষকদের সিউডো-পরীক্ষক হিসেবে ডিজাইন করে ভাইভা দিন এবং আপনার উত্তর মূল্যায়ন করুন।
                  </p>
                </div>

                {!vivaActive && (
                  <button
                    onClick={startVivaSession}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    নতুন ভাইভা শুরু করুন
                  </button>
                )}
              </div>

              {!vivaActive ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto py-10 space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">মক ভাইভা বোর্ড টেস্ট নির্দেশনাবলী:</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      ১. এই বোর্ডে সিভিল কন্সট্রাকশন, এস্টিমেটিং, সয়েল মেকানিক্স ও আরসিসি ক্যাটাগরী থেকে <strong>এলোমেলোভাবে (Non-Serially) ১০টি চমৎকার প্রশ্ন</strong> নির্বাচন করে পরীক্ষা নেয়া হবে। <br />
                      ২. প্রতিটি প্রশ্নের উত্তর স্পষ্টভাবে বাংলা অথবা ইংরেজিতে রেকর্ড করতে পারেন। <br />
                      ৩. সঠিক উত্তরের ভিত্তিতে মোট ১০০ নম্বরের মক জিপিএ স্কোর প্রদান করা হবে।
                    </p>
                  </div>
                  <button
                    onClick={startVivaSession}
                    className="bg-blue-650 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-all shadow-md shadow-blue-500/15"
                  >
                    মক ভাইভা বোর্ড শুরু করুন
                  </button>
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-visible">
                  {/* Active Question Box Area */}
                  <div className="lg:col-span-8 flex flex-col gap-5 h-full">
                    {/* Active Question Container card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                          প্রশ্ন নং: {vivaIndex + 1} / {currentVivaQuestions.length}
                        </span>
                        <span className="text-xs text-slate-450 font-mono font-medium">
                          স্কোর: {vivaScore} / ১০০
                        </span>
                      </div>

                      <div className="mb-5 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border-l-4 border-blue-600 rounded-r-lg shadow-sm">
                        <span className="text-[10px] font-bold text-blue-600/90 block mb-1.5 uppercase tracking-widest leading-none">
                          পরীক্ষকের বোর্ড প্রশ্ন (Question Type):
                        </span>
                        <p className="text-sm md:text-base text-slate-800 font-extrabold leading-relaxed">
                          " {currentVivaQuestions[vivaIndex]?.question || ""} "
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <label className="text-xs block text-slate-500 font-extrabold uppercase tracking-wider">
                            আপনার উত্তর প্রদান করুন (বাংলায় / English):
                          </label>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Speech language selector */}
                            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-300">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isListeningAnswer) {
                                    try { recognitionRef.current?.stop(); } catch(e){}
                                    setIsListeningAnswer(false);
                                  }
                                  setVoiceLang("bn-BD");
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  voiceLang === "bn-BD"
                                    ? "bg-white text-blue-750 shadow-sm font-black"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                🇧🇩 বাংলা
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isListeningAnswer) {
                                    try { recognitionRef.current?.stop(); } catch(e){}
                                    setIsListeningAnswer(false);
                                  }
                                  setVoiceLang("en-US");
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  voiceLang === "en-US"
                                    ? "bg-white text-blue-755 shadow-sm font-black"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                🇺🇸 English
                              </button>
                            </div>

                            {/* Microphone recording button */}
                            <button
                              type="button"
                              onClick={handleToggleVoiceInput}
                              className={`flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full text-[10px] font-extrabold transition-all shadow-sm ${
                                isListeningAnswer
                                  ? "bg-red-50 border-red-500 text-red-600 animate-pulse ring-2 ring-red-100"
                                  : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
                              }`}
                              title={isListeningAnswer ? "রেকর্ডিং বন্ধ করুন" : "কথা বলে উত্তর লিখুন (Speech-to-Text)"}
                            >
                              {isListeningAnswer ? (
                                <>
                                  <MicOff className="w-3 h-3 text-red-600 animate-bounce shrink-0" />
                                  <span>রেকর্ডিং থামান</span>
                                </>
                              ) : (
                                <>
                                  <Mic className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span>কথা বলুন (Voice Answer)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <textarea
                            rows={4}
                            value={vivaUserAnswer}
                            onChange={(e) => setVivaUserAnswer(e.target.value)}
                            placeholder={
                              isListeningAnswer 
                                ? `মাইক্রোফোন চালু আছে। অনুগ্রহ করে ${voiceLang === "bn-BD" ? "বাংলায়" : "ইংরেজিতে"} স্পষ্ট কথা বলুন...` 
                                : `এখানে উত্তর টাইপ করুন অথবা উপরের বোতাম টিপে ${voiceLang === "bn-BD" ? "বাংলায়" : "ইংরেজিতে"} কথা বলুন...`
                            }
                            className={`w-full bg-white border focus:border-blue-500 focus:outline-none rounded-lg p-3 text-sm text-slate-800 transition-all ${
                              isListeningAnswer ? "border-red-400 ring-2 ring-red-100 bg-red-50/5" : "border-slate-250"
                            }`}
                          />
                          {isListeningAnswer && (
                            <span className="absolute bottom-3 right-3 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                          )}
                        </div>

                        {voiceSupportError && (
                          <div className="text-[11px] text-red-650 font-medium bg-red-55/60 border border-red-200 rounded px-2.5 py-1.5">
                            ⚠️ {voiceSupportError}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2.5 mt-4">
                        <button
                          onClick={skipVivaQuestion}
                          className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          এড়িয়ে যান (Skip)
                        </button>
                        <button
                          onClick={handleVivaSubmitAnswer}
                          disabled={isEvaluatingViva || !vivaUserAnswer.trim()}
                          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all sm:w-auto ${
                            isEvaluatingViva && "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {isEvaluatingViva ? "উত্তর পরীক্ষণ হচ্ছে..." : "উত্তর জমা দিন"}
                        </button>
                      </div>
                    </div>

                    {/* Show Grade card summary after all questions are completed */}
                    {vivaShowGradeCard && (
                      <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-xl shadow-sm text-slate-800 space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                          <div>
                            <h3 className="font-extrabold text-lg text-emerald-900">
                              অভিনন্দন! আপনার ভাইভা সেশন সম্পন্ন হয়েছে।
                            </h3>
                            <p className="text-xs text-emerald-700 font-medium">
                              মক ভাইভা সেশনের মূল্যায়ন কার্ড তৈরি হয়েছে।
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono">
                          <div className="bg-white p-3 rounded-lg border border-emerald-150 text-center">
                            <div className="text-[10px] text-slate-400">সর্বমোট স্কোর</div>
                            <div className="text-2xl font-bold text-slate-800">{vivaScore} / 100</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-emerald-150 text-center">
                            <div className="text-[10px] text-slate-400">গ্রেড (Grade)</div>
                            <div className="text-2xl font-bold text-emerald-600">
                              {vivaScore >= 80 ? "A+ Outstanding" : vivaScore >= 60 ? "A Excellent" : "B Average"}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-emerald-150 text-center col-span-2 md:col-span-1">
                            <div className="text-[10px] text-slate-400">উত্তর ট্র্যাকার</div>
                            <div className="text-2xl font-bold text-slate-800">
                              {vivaLogs.filter(l => l.evaluation !== "Needs Improvement").length} / {currentVivaQuestions.length} উত্তীর্ণ
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={startVivaSession}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                          >
                            পুনরায় পরীক্ষা দিন
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("study_desk");
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Math.random().toString(),
                                  role: "user",
                                  content: `আমি ভাইভায় ${vivaScore} পেয়ে উত্তীর্ণ হয়েছি। আমার সিভিল ড্রয়িং বা ডাইমেনশন সংক্রান্ত আরও পড়াশোনা সাহায্য দরকার।`,
                                  timestamp: new Date()
                                }
                              ]);
                              handleSendChat();
                            }}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                          >
                            শিক্ষকের থেকে বিস্তারিত টিউটোরিয়াল নিন
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Question evaluation tracker panel (Right side card) */}
                  <div className="lg:col-span-4 flex flex-col h-full bg-slate-50 border border-slate-250 p-4 rounded-xl shadow-inner scrollbar-none overflow-y-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">
                      পরীক্ষার রেকর্ড ও বিস্তারিত উত্তর গাইড
                    </span>

                    {vivaLogs.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-10 flex-grow">
                        কোনো প্রশ্ন মূল্যায়ন সম্পন্ন হয়নি। উত্তর জমা দেওয়ার পর এখানে রেকর্ড এবং সঠিক রেফারেন্স দেখা যাবে।
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {vivaLogs.map((log, idx) => (
                          <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                            <div className="flex justify-between items-center mb-1.5 font-bold">
                              <span>প্রশ্ন নং: {idx + 1}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                                  log.evaluation === "Excellent"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : log.evaluation === "Good"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {log.evaluation}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-1.5 italic">" {log.q} "</p>
                            <div className="border-t border-slate-100 pt-1.5">
                              <span className="font-bold block text-slate-500 mb-1">সঠিক আদর্শ উত্তর ব্যাখ্যা:</span>
                              <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded border border-slate-150">
                                {log.feedback}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MICROSOFT OFFICE TEMPLATES & PROJECT CHECKLISTS */}
          {activeTab === "office_projects" && (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-250 p-5 md:p-6 flex flex-col h-full overflow-y-auto">
              
              {/* Top Title Section */}
              <div className="mb-5 border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    🛠️ সিভিল আইসিটি ল্যাব ও প্রজেক্ট গাইডবুক (Office & BBS Pro)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    রাজশাহী পলিটেকনিক ইনস্টিটিউট সিভিল ডিপার্টমেন্টের থিসিস পেপার ফরম্যাট, এস্টিমেশন হিসাব এবং প্রজেক্ট ট্র্যাকার ল্যাব।
                  </p>
                </div>
                
                {/* Switcher Button Rail */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setProjectSubTab("bbs")}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                      projectSubTab === "bbs" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📊 BBS Excel Pro
                  </button>
                  <button
                    onClick={() => setProjectSubTab("word")}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                      projectSubTab === "word" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📄 Word Thesis Format
                  </button>
                  <button
                    onClick={() => setProjectSubTab("supervisor")}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                      projectSubTab === "supervisor" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🎓 Project Supervisor
                  </button>
                </div>
              </div>

              {/* ACTIVE SUB-TAB CONTAINER */}
              <div className="flex-grow min-h-0">
                
                {/* SUB TAB 1: BBS EXCEL PRO CALCULATOR */}
                {projectSubTab === "bbs" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Input Controls Card */}
                    <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-850 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          রড ওজন ও বার বেন্ডিং শিডিউল ক্যালকুলেটর
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ছাদের রড বা কলামের রডের সঠিক ওজন ও মোট সিভিল প্রাক্কলন খরচ বের করুন।
                        </p>
                      </div>

                      {/* Rod diameter selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          রডের ব্যাস (Diameter, D):
                        </label>
                        <select
                          value={bbsDiameter}
                          onChange={(e) => setBbsDiameter(Number(e.target.value))}
                          className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg text-slate-800 outline-none focus:border-blue-500"
                        >
                          {[8, 10, 12, 16, 20, 22, 25, 32].map(d => (
                            <option key={d} value={d}>{d} মিলিমিটার (mm)</option>
                          ))}
                        </select>
                      </div>

                      {/* Unit Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          পরিমাপের ইউনিট (Length Unit):
                        </label>
                        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-md">
                          <button
                            onClick={() => { setBbsUnit("m"); }}
                            className={`flex-1 text-center py-1 text-xs font-bold rounded-md transition-colors ${
                              bbsUnit === "m" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            মিটার (meters)
                          </button>
                          <button
                            onClick={() => { setBbsUnit("ft"); }}
                            className={`flex-1 text-center py-1 text-xs font-bold rounded-md transition-colors ${
                              bbsUnit === "ft" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            ফিট (feet)
                          </button>
                        </div>
                      </div>

                      {/* Length field */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          একক রডের দৈর্ঘ্য (Length, L):
                        </label>
                        <input
                          type="number"
                          placeholder="রডের দৈর্ঘ্য লিখুন..."
                          value={bbsLength}
                          onChange={(e) => setBbsLength(Math.max(1, Number(e.target.value)))}
                          className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg text-slate-800 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      {/* Quantity field */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          রডের সংখ্যা (Total Quantity, Qty):
                        </label>
                        <input
                          type="number"
                          placeholder="সংখ্যা লিখুন..."
                          value={bbsQty}
                          onChange={(e) => setBbsQty(Math.max(1, Number(e.target.value)))}
                          className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg text-slate-800 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const unitName = bbsUnit === "m" ? "মিটার" : "ফিট";
                          const query = `আমি Microsoft Excel এ ${bbsDiameter} মিলিমিটার ব্যাসের ${bbsLength} ${unitName} দীর্ঘ সম্পন্ন ${bbsQty} টি রডের বার বেন্ডিং শিডিউল (BBS) লেআউট বানাতে চাই। এর জন্য এক্সেল ফর্মুলা, রডের মোট ওজন নির্ণয় এবং গ্রাফিকাল কলাম লেআউট পদ্ধতিটি বুজিয়ে দাও।`;
                          askAssistant(query, "Project Mode");
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm mt-1"
                      >
                        📊 বিস্তারিত লেআউট এআই-এর কাছে পাঠান
                      </button>
                    </div>

                    {/* Output Report & Formulas Screen */}
                    <div className="lg:col-span-7 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="border-b border-slate-100 pb-3 mb-4">
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            রিয়েল-টাইম ক্যালকুলেশন রিপোর্ট
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">
                            {bbsDiameter}mm রিবার ক্যাটাগরি প্রাক্কলন
                          </h4>
                        </div>

                        {/* Interactive Result Dashboard */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">রডের মোট ওজন (Weight)</span>
                            <span className="text-2xl font-black text-slate-800 font-mono">
                              {((bbsDiameter * bbsDiameter / (bbsUnit === "m" ? 162.2 : 532.8)) * bbsLength * bbsQty).toFixed(3)}
                            </span>
                            <span className="text-xs font-bold text-slate-500 ml-1">কেজি (Kg)</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">বাজারমূল্য (Est. Cost)</span>
                            <span className="text-2xl font-black text-slate-800 font-mono">
                              {(((bbsDiameter * bbsDiameter / (bbsUnit === "m" ? 162.2 : 532.8)) * bbsLength * bbsQty) * 105).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-xs font-bold text-slate-500 ml-1">টাকা (৳)</span>
                          </div>
                        </div>

                        {/* Step By Step Mathematical Formula Display */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-2.5">
                          <div className="font-bold border-b border-slate-200 pb-1.5 text-slate-800">
                            📐 প্রাক্কলন গাণিতিক ব্যাখ্যা (Unit Weight Formula):
                          </div>
                          <div>
                            {bbsUnit === "m" ? (
                              <>
                                <span>১ মিটার রডের সূত্র: </span>
                                <code className="bg-blue-100/60 px-1 py-0.5 rounded text-blue-700 font-bold">W = D² / 162.2</code>
                              </>
                            ) : (
                              <>
                                <span>১ ফিট রডের সূত্র: </span>
                                <code className="bg-blue-100/60 px-1 py-0.5 rounded text-blue-700 font-bold">W = D² / 532.8</code>
                              </>
                            )}
                          </div>
                          <div>
                            <span>হিসাব ধাপসমূহ:</span>
                            <ul className="list-decimal list-inside pl-1 mt-1 text-slate-600 space-y-1">
                              <li>{bbsDiameter}² / {bbsUnit === "m" ? "162.2" : "532.8"} = {(bbsDiameter * bbsDiameter / (bbsUnit === "m" ? 162.2 : 532.8)).toFixed(4)} কেজি/(প্রতি {bbsUnit === "m" ? "মিটার" : "ফিট"})</li>
                              <li>মোট দৈর্ঘ্য = {bbsLength} {bbsUnit === "m" ? "মিটার" : "ফিট"} × {bbsQty} টি = {bbsLength * bbsQty} {bbsUnit === "m" ? "মিটার" : "ফিট"}</li>
                              <li>মোট ওজন = {(bbsDiameter * bbsDiameter / (bbsUnit === "m" ? 162.2 : 532.8)).toFixed(4)} × {bbsLength * bbsQty} = {((bbsDiameter * bbsDiameter / (bbsUnit === "m" ? 162.2 : 532.8)) * bbsLength * bbsQty).toFixed(3)} কেজি</li>
                              <li>মোট খরচ (আনুমানিক ১০৫ টাকা/কেজি) = {(((bbsDiameter * bbsDiameter / (bbsUnit === "m" ? 162.2 : 532.8)) * bbsLength * bbsQty) * 105).toFixed(1)} ৳</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Excel Formula copy helper */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-4 text-[11px] text-blue-800 leading-normal">
                        <strong>📊 এক্সেল ফর্মুলা ব্যবহারের টিপস:</strong> আপনার এক্সেল শিটে রডের ডায়ামিটার কলাম <code>A2</code> এবং রডের দৈর্ঘ্য কলাম <code>B2</code> হলে সি৩ (C3) সেলে লিখুন: <code>=(A2^2)/162.2*B2</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB 2: MICROSOFT WORD THESIS LAYOUT SIMULATOR */}
                {projectSubTab === "word" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
                    {/* Controls Column */}
                    <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-850 flex items-center gap-1.5">
                          <span className="p-1 bg-blue-100 rounded text-blue-800 text-[10px]">DOC</span>
                          থিসিস ফরম্যাটিং এবং পেপার লেআউট স্যান্ডবক্স
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ডিপ্লোমা সেমিস্টার প্রজেক্ট রিপোর্ট তৈরির স্ট্যান্ডার্ড নিয়মগুলো সরাসরি পরীক্ষা করে দেখুন।
                        </p>
                      </div>

                      {/* Left Margin slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[11px] text-slate-600 font-bold">
                          <span>বাম মার্জিন (Left Margin - Binding):</span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-xs">{wordMarginLeft} ইঞ্চি</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.1"
                          value={wordMarginLeft}
                          onChange={(e) => setWordMarginLeft(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                        <span className="text-[9px] text-slate-400 block mt-0.5">*রিপোর্ট বাইন্ডিং স্পেসের জন্য বামে অতিরিক্ত মার্জিন প্রয়োজন হয়।</span>
                      </div>

                      {/* Other Margins slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[11px] text-slate-600 font-bold">
                          <span>অন্যান্য মার্জিন (Top/Bottom/Right):</span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-xs">{wordMarginOthers} ইঞ্চি</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={wordMarginOthers}
                          onChange={(e) => setWordMarginOthers(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>

                      {/* Line Spacing */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          লাইন স্পেসিং (Line Spacing):
                        </label>
                        <select
                          value={wordLineSpacing}
                          onChange={(e) => setLineSpacing(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg text-slate-800 outline-none focus:border-blue-500"
                        >
                          <option value="1.0">Single (১.০)</option>
                          <option value="1.15">1.15 (১.১৫)</option>
                          <option value="1.5">Double Standard (১.৫)</option>
                          <option value="2.0">Double (২.০)</option>
                        </select>
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          হেডিং ও বডি টেক্সট ফন্ট সাইজ (Font Size):
                        </label>
                        <div className="flex gap-2">
                          {[11, 12, 14].map(sz => (
                            <button
                              key={sz}
                              onClick={() => setWordFontSize(sz)}
                              className={`flex-1 py-1.5 font-mono text-xs rounded border transition-colors ${
                                wordFontSize === sz ? "bg-blue-600 text-white font-bold border-blue-500" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {sz}pt
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const query = `আমি Microsoft Word-এ আমার ফাইনাল সেমিস্টার থিসিস প্রজেক্ট রাইটিং ফরম্যাট করতে চাই। মেইট সেটিংস হলো: Left Margin ${wordMarginLeft}\", Top/Bottom/Right ${wordMarginOthers}\", Spacing ${wordLineSpacing}, বডি টেক্সট ফন্ট সাইজ ${wordFontSize}pt। আমাকে স্ট্যান্ডার্ড মার্জিন, শিরোনাম, উপ-শিরোনাম (Heading, Subheading) কোড এবং রাজশাহী পলিটেকনিকের কভার পেইজ লেআউটের গাইডলাইন দিন।`;
                          askAssistant(query, "Project Mode");
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                      >
                        📄 থিসিস মার্জিন গাইড এআই-এর কাছে পাঠান
                      </button>
                    </div>

                    {/* Paper Layout Sandbox Screen */}
                    <div className="lg:col-span-7 border border-slate-200 rounded-xl p-5 flex flex-col items-center bg-slate-100 justify-center">
                      <div className="text-[10px] text-slate-450 uppercase font-bold mb-3 tracking-widest text-center">
                        🖥️ লাইভ A4 থিসিস শিট পেপার প্রিভিউ (Simulated Sheet)
                      </div>
                      
                      {/* Dynamic Paper Container Box */}
                      <div className="w-full max-w-sm aspect-[1/1.4] bg-white border border-slate-300 shadow-lg rounded p-3 flex flex-col justify-between transition-all relative">
                        
                        {/* Dynamic Margin Guide Line Indicators */}
                        <div 
                          style={{
                            paddingTop: `${wordMarginOthers * 24}px`,
                            paddingBottom: `${wordMarginOthers * 24}px`,
                            paddingLeft: `${wordMarginLeft * 24}px`,
                            paddingRight: `${wordMarginOthers * 24}px`,
                          }}
                          className="flex-1 flex flex-col justify-start h-full"
                        >
                          {/* Simulated margins dashes overlay for educational rendering */}
                          <div className="absolute inset-0 border border-slate-200 pointer-events-none border-dashed"
                            style={{
                              top: `${wordMarginOthers * 24}px`,
                              bottom: `${wordMarginOthers * 24}px`,
                              left: `${wordMarginLeft * 24}px`,
                              right: `${wordMarginOthers * 24}px`,
                            }}
                          />

                          <div className="border-b border-slate-350 pb-1 mb-2">
                            <h4 className="font-extrabold text-slate-800 leading-normal" style={{ fontSize: `${wordFontSize + 2}px` }}>
                              CHAPTER 1: INTRODUCTION
                            </h4>
                          </div>

                          <div className="text-slate-600 font-serif leading-relaxed text-left flex-1"
                            style={{ 
                              fontSize: `${wordFontSize - 3}px`, 
                              lineHeight: `${Number(wordLineSpacing)}` 
                            }}
                          >
                            Civil engineering is a professional engineering discipline that deals with the design, construction, and maintenance of the physical and naturally built environment. In Bangladesh, diploma engineers from Rajshahi Polytechnic Institute are playing a vital role in national infrastructure.
                          </div>

                          <div className="text-right text-[10px] text-slate-400 mt-2 border-t pt-1 border-slate-150">
                            Page 1
                          </div>
                        </div>
                      </div>

                      {/* Info Badge */}
                      <div className="text-[11px] text-slate-600 mt-3.5 text-center leading-normal max-w-md bg-white border border-slate-200 rounded-lg p-2.5">
                        💡 <strong>মেজারমেন্ট টিপস:</strong> ডানে, উপরে এবং নিচে রয়েছে <strong>{wordMarginOthers}\"</strong> স্ট্যান্ডার্ড ফাঁকা জায়গা এবং বামে বাইন্ডিং হোল কভারের জন্য রয়েছে <strong>{wordMarginLeft}\"</strong> অতিরিক্ত ফাঁকা জায়গা।
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB 3: POLYTECHNIC ACADEMIC PROJECT SUPERVISOR */}
                {projectSubTab === "supervisor" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left side list of 5 premium project directories */}
                    <div className="lg:col-span-5 flex flex-col gap-3 max-h-[450px] overflow-y-auto">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        📁 ৫টি রাজশাহী পলিটেকনিক থিসিস ক্যাটাগরি:
                      </span>
                      {[
                        {
                          id: 0,
                          title: "फ्लाइ অ্যাশ ইটের কম্প্রেশন ট্রায়াল",
                          sub: "Fly Ash Carbon Neutral Bricks Strength Test",
                          icon: "🧱"
                        },
                        {
                          id: 1,
                          title: "পদ্মা নদীর বালি FM ট্রায়াল",
                          sub: "Local Sand FM & Concrete Strengh Correlation",
                          icon: "⏳"
                        },
                        {
                          id: 2,
                          title: "ক্যাম্পাস রেইন-ওয়াটার হার্ভেস্টিং",
                          sub: "Campus Rainwater Filtering Chamber Spec",
                          icon: "💧"
                        },
                        {
                          id: 3,
                          title: "গ্লাস ফাইবার কংক্রিট ট্রায়াল",
                          sub: "Glass Fiber Reinforcement Flexural Test",
                          icon: "📐"
                        },
                        {
                          id: 4,
                          title: "সেলফ-কমপ্যাক্টিং ফ্লো এনালাইসিস",
                          sub: "Self-Compacting Concrete Flow Quality Test",
                          icon: "🧪"
                        }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProjectId(p.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                            selectedProjectId === p.id 
                              ? "bg-purple-50 border-purple-300 text-purple-900 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="text-xl shrink-0">{p.icon}</span>
                          <div className="truncate leading-tight">
                            <h4 className="text-xs font-bold truncate">{p.title}</h4>
                            <span className="text-[10px] text-slate-450 font-mono truncate block mt-0.5">{p.sub}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Right side Detail Panel with live completion percent Gantt progress bar */}
                    <div className="lg:col-span-7 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                      {(() => {
                        const projectList = [
                          {
                            title: "Environmental Circular Bricks with Fly Ash Trials",
                            titleBn: "ফ্লাই অ্যাশ ইটের শক্তি ট্রায়াল পরীক্ষা ও বাণিজ্যিক ভ্যালু যাচাইকরণ",
                            abstract: "কোল পাওয়ার প্ল্যান্ট থেকে নির্গত বর্জ্য ফ্লাই অ্যাশ ব্যবহার করে পরিবেশ-বান্ধব ব্লক ও ইট কাস্টিং করে ল্যাবরেটরিতে এর কম্প্রেশন টেষ্ট পরিচালন করা এবং সাধারণ ৩-পকেট ইটের তুলনায় এর নির্ভরযোগ্যতা ও খরচ বের করা।",
                            materials: "কোল পাওয়ার প্ল্যান্ট ফ্লাই অ্যাশ, সিমেন্ট, লোকাল বালি, সিলিকন মোল্ড, হাইড্রোলিক প্রেস",
                            optimalFM: "বালি এফএম ১.৫ (মিডিয়াম)",
                            queryPrompt: "ফ্লাই অ্যাশ ইটের শক্তি ট্রায়াল পরীক্ষা ডিজাইন, কাস্টিং মিক্স অনুপাত এবং ডিপ্লোমা সিভিল থিসিস ফরম্যাটিং পেপার বিস্তারিত লিখে দাও।"
                          },
                          {
                            title: "Rajshahi Sand Fineness Modulus Specimen Studies",
                            titleBn: "রাজশাহী অঞ্চলের পদ্মা নদীর বালির FM অনুযায়ী কংক্রিট ডিজাইন স্ট্রেন্থ",
                            abstract: "ASTM স্ট্যান্ডার্ড অনুযায়ী সিভ সেট ব্যবহার করে পদ্মা বালি এবং মোটা সিলেটের বালির FM বের করে গাণিতিক সমন্বয় করা। পরবর্তীতে ভিন্ন ভিন্ন FM এর বালি দিয়ে কংক্রিট সিলিন্ডার প্রস্তুত করে ইউনিভার্সাল টেস্টিং মেশিনে (UTM) ক্রাশিং লোড টেষ্ট করা।",
                            materials: "লোকাল পদ্মা স্যান্ড, মোটা সিলেট লাল বালি, কাস্টিং সিলিন্ডার, ASTM চালুনী সেট, ওভেন ড্রাই ফ্রেম",
                            optimalFM: "লোকাল পদ্মা বালি এফএম ১.৪, সিলেট লাল বালি এফএম ২.৮",
                            queryPrompt: "রাজশাহী অঞ্চলের পদ্মা নদীর বালির FM নির্ধারণ ও কংক্রিট সিলিন্ডার শক্তি পরীক্ষার সম্পূর্ণ ল্যাবরেটরি রিপোর্ট মেথডলজি প্রদান করুন।"
                          },
                          {
                            title: "Smart Rainwater Harvesting & Filtration Chambers",
                            titleBn: "পলিটেকনিক ক্যাম্পাসে রেইন-ওয়াটার হারভেস্টিং ও মাল্টি-লেয়ার ফিল্টার ডিজাইন",
                            abstract: "পলিটেকনিক একাডেমিক ভবনের ক্যাচমেন্ট এরিয়া বা ছাদের ঢালের ক্ষেত্রফল ব্যবহার করে বর্ষাকালীন মোট বৃষ্টিপাত হিসাব করা। পরে পানি পরিষ্কারের উদ্দেশ্যে নুড়িপথ, কয়লা, বালির সমন্বয়ে একটি গ্রাভিটি মাল্টি-লেয়ার ফিল্টার চেম্বার ডিজাইন সিলেকশন করা।",
                            materials: "পিভিসি ডাউনটেক পাইপ, অ্যাক্টিভেটেড চারকোল গ্রানুলাস, গ্রাভেল কোয়ার্টস পাথর, মিহি ও মোটা বালি ফিল্টার বেড",
                            optimalFM: "মোটা নুড়ি বালি (FM ৩.২)",
                            queryPrompt: "রাজশাহী পলিটেকনিক ক্যাম্পাস ক্যাম্পাসের জন্য রেইন ওয়াটার কালেকশন স্লিপ ও ফিল্টারিং চেম্বারের মেকানিজম লেআউট বুঝিয়ে দিন।"
                          },
                          {
                            title: "Glass Fiber-Reinforced Concrete Structural Tensile Tests",
                            titleBn: "কংক্রিট মরটারে গ্লাস ফাইবার মিশ্রণের ফলে নমনীয়তা ও ফাটল প্রতিরোধ ট্রায়াল",
                            abstract: "আরসিসি প্লাস্টারিং কাদার সাথে ০.৫% এবং ১.০% অনুপাতে মডিফাইড গ্লাস ফাইবার এলিমেন্ট মিক্স করে এর নমনীয়তা (Flexural Strength) বৃদ্ধি এবং কংক্রিট যখন কিউরিং হয় তখন এর গায়ে হেয়ারলাইন ফাটল রোধের ল্যাব টেস্ট পরিচালনা করা।",
                            materials: "মোমেন্ট-রেজিস্ট্যান্ট গ্লাস ফাইবার, কন্সট্রাকশন পোর্টল্যান্ড সিমেন্ট, রিবার ট্রায়াল ক্যাচ",
                            optimalFM: "মিডিয়াম বালি (FM ১.৬)",
                            queryPrompt: "গ্লাস ফাইবার মিশ্রিত কংক্রিট স্ল্যাবের টেনসিল ও ফ্লেক্সারাল নমনীয়তা পরীক্ষার প্রসেস ও ডাটা এনালাইসিস বিস্তারিত বুঝিয়ে লিখুন।"
                          },
                          {
                            title: "Self-Compacting Concrete Flow Performance Tests",
                            titleBn: "সেলফ-কমপ্যাক্টিং কংক্রিট (SCC) এর ফ্লো ও ওয়ার্কাবিলিটি সান্দ্রতা পরীক্ষা",
                            abstract: "অধিক ঘন রডের জটিল স্ট্রাকচারে যেখানে ভাইব্রেটর ব্যবহার প্রায় অসম্ভব, সেখানে নিজে নিজেই ছড়িয়ে পড়তে পারে এমন সেলফ-কমপ্যাক্টিং কংক্রিট মিক্স তৈরি এবং Slump Flow ও L-Box টেস্টের সমন্বয়ে এর সান্দ্রতা পরিমাপ করা।",
                            materials: "সুপারপ্লাস্টিসাইজার কেমিক্যাল এডমিক্সচার, কোয়ার্টস পাউডার, ফাইন ফ্লাই অ্যাশ, স্টোন চিপস্",
                            optimalFM: "সিলেট ও পদ্মা স্যান্ড মিক্সচার (FM ২.৪)",
                            queryPrompt: "সেলফ-কমপ্যাক্টিং কংক্রিট তৈরিতে এডমিক্সচারের নিয়মাবলী এবং Slump Flow ল্যাব টেস্টিং প্রোটোকল বিশদ তুলে ধরুন।"
                          }
                        ];

                        const activeProj = projectList[selectedProjectId] || projectList[0];
                        const countDone = projectMilestones.filter(m => m.done).length;
                        const percentComplete = Math.round((countDone / projectMilestones.length) * 100);

                        return (
                          <>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                              {/* Title Info */}
                              <div className="border-b border-slate-100 pb-2">
                                <span className="text-[9px] font-mono text-purple-600 bg-purple-150 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                  {activeProj.title}
                                </span>
                                <h4 className="text-sm font-extrabold text-slate-800 mt-1 leading-normal">
                                  {activeProj.titleBn}
                                </h4>
                              </div>

                              {/* Live Progress Gantt Bar */}
                              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1.5">
                                  <span>🚀 সেমিস্টার ফাইনাল প্রজেক্ট অগ্রগতি ট্র্যাকার:</span>
                                  <span className="text-purple-650 tracking-wider font-mono bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">{percentComplete}% সম্পন্ন</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
                                  <div 
                                    className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                                    style={{ width: `${percentComplete}%` }}
                                  />
                                </div>
                              </div>

                              {/* Project description list details */}
                              <div className="space-y-2 text-xs text-slate-650 leading-relaxed bg-slate-50 border border-slate-150 rounded-xl p-3">
                                <div>
                                  <strong className="text-slate-800 block text-[11px]">সংক্ষিপ্ত উদ্দেশ্য (Abstract):</strong>
                                  <p className="text-[11px] text-slate-600 mt-0.5">{activeProj.abstract}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 mt-2">
                                  <div>
                                    <strong className="text-slate-800 block text-[10px]">প্রয়োজনীয় ল্যাব ম্যাটেরিয়ালস:</strong>
                                    <span className="text-[10px] text-slate-500 font-mono leading-tight">{activeProj.materials}</span>
                                  </div>
                                  <div>
                                    <strong className="text-slate-800 block text-[10px]">আদর্শ এফএম (FM Scope):</strong>
                                    <span className="text-[10px] text-purple-650 font-bold">{activeProj.optimalFM}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Interactive Sieve Milestones */}
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">
                                  🎯 প্রজেক্ট মাইলস্টোন ও প্রোগ্রেস চেকলিস্ট (Tap to toggle):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {projectMilestones.map((milestone) => (
                                    <label
                                      key={milestone.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                                        milestone.done 
                                          ? "bg-emerald-50/50 border-emerald-250 text-emerald-800 font-semibold"
                                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={milestone.done}
                                        onChange={() => {
                                          setProjectMilestones(prev => 
                                            prev.map(m => m.id === milestone.id ? { ...m, done: !m.done } : m)
                                          );
                                        }}
                                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3 w-3"
                                      />
                                      <span className="truncate">{milestone.text}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* CTA Ask supervisor button */}
                            <button
                              onClick={() => {
                                const completedSteps = projectMilestones.filter(m => m.done).map(m => m.text).join(", ");
                                const nextPending = projectMilestones.find(m => !m.done)?.text || "সবগুলো ধাপ";
                                const query = `আমি সেমিস্টার ফাইনাল প্রজেক্ট হিসেবে "${activeProj.titleBn} (${activeProj.title})" নিয়ে কাজ করছি। ইতিমধ্যে আমি "${completedSteps || "কোনটিই নয়"}" সম্পন্ন করেছি। এখন আমার পরবর্তী পদক্ষেপ "${nextPending}" কিভাবে সমাধান করবো এবং রাজশাহী পলিটেকনিকের শিক্ষকদের রিকমেন্ডেশন অনুযায়ী ল্যাব টেস্ট ডাটার আদর্শ মান কিভাবে এস্টিমেট করবো তা বুঝিয়ে দিন।`;
                                askAssistant(query, "Project Mode");
                              }}
                              className="w-full mt-4 py-2.5 bg-purple-650 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-purple-500/10 text-center"
                            >
                              💼 সিভিল প্রজেক্ট সুপরভাইজারকে জিজ্ঞেস করুন (এআই চ্যাট)
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}



        </div>
      </main>
    </div>
  );
}
