const ceSubjects = [
  // SEM01
  { name: 'Engineering Mathematics I', code: '3110001', sem: 'SEM01' },
  { name: 'Engineering Physics', code: '3110003', sem: 'SEM01' },
  { name: 'Basic Electrical Engineering', code: '3110005', sem: 'SEM01' },
  { name: 'Environmental Sciences', code: '3110007', sem: 'SEM01' },

  // SEM02
  { name: 'Engineering Mathematics II', code: '3110014', sem: 'SEM02' },
  { name: 'Engineering Chemistry', code: '3110015', sem: 'SEM02' },
  { name: 'Basic Mechanical Engineering', code: '3110006', sem: 'SEM02' },
  { name: 'Engineering Graphics', code: '3110016', sem: 'SEM02' },

  // SEM03
  { name: 'Data Structures', code: '3130702', sem: 'SEM03' },
  { name: 'Digital Electronics', code: '3130703', sem: 'SEM03' },
  { name: 'Discrete Mathematics', code: '3130704', sem: 'SEM03' },
  {
    name: 'Object Oriented Programming using C++',
    code: '3130705',
    sem: 'SEM03',
  },

  // SEM04
  { name: 'Database Management System', code: '3140707', sem: 'SEM04' },
  {
    name: 'Computer Organization and Architecture',
    code: '3140708',
    sem: 'SEM04',
  },
  { name: 'Operating System', code: '3140709', sem: 'SEM04' },
  { name: 'Design and Analysis of Algorithms', code: '3140710', sem: 'SEM04' },

  // SEM05
  { name: 'Software Engineering', code: '3150711', sem: 'SEM05' },
  { name: 'Computer Networks', code: '3150712', sem: 'SEM05' },
  { name: 'Theory of Computation', code: '3150713', sem: 'SEM05' },
  { name: 'Microprocessor and Interfacing', code: '3150714', sem: 'SEM05' },

  // SEM06
  { name: 'Web Technology', code: '3160713', sem: 'SEM06' },
  { name: 'Compiler Design', code: '3160714', sem: 'SEM06' },
  { name: 'Artificial Intelligence', code: '3160715', sem: 'SEM06' },
  { name: 'Data Mining', code: '3160716', sem: 'SEM06' },

  // SEM07
  { name: 'Machine Learning', code: '3170717', sem: 'SEM07' },
  { name: 'Cloud Computing', code: '3170718', sem: 'SEM07' },
  { name: 'Information Security', code: '3170719', sem: 'SEM07' },
  { name: 'Big Data Analytics', code: '3170720', sem: 'SEM07' },

  // SEM08
  { name: 'Project Phase I', code: '3180717', sem: 'SEM08' },
  { name: 'Project Phase II', code: '3180718', sem: 'SEM08' },
  { name: 'Cyber Security', code: '3180719', sem: 'SEM08' },
  { name: 'Mobile Application Development', code: '3180720', sem: 'SEM08' },
];
const itSubjects = [
  // SEM01
  { name: 'Engineering Mathematics I', code: '3110001', sem: 'SEM01' },
  { name: 'Engineering Physics', code: '3110003', sem: 'SEM01' },
  { name: 'Basic Electrical Engineering', code: '3110005', sem: 'SEM01' },
  { name: 'Environmental Sciences', code: '3110007', sem: 'SEM01' },

  // SEM02
  { name: 'Engineering Mathematics II', code: '3110014', sem: 'SEM02' },
  { name: 'Engineering Chemistry', code: '3110015', sem: 'SEM02' },
  { name: 'Basic Mechanical Engineering', code: '3110006', sem: 'SEM02' },
  { name: 'Engineering Graphics', code: '3110016', sem: 'SEM02' },

  // SEM03
  { name: 'Data Structures', code: '3130802', sem: 'SEM03' },
  { name: 'Digital Electronics', code: '3130803', sem: 'SEM03' },
  { name: 'Discrete Mathematics', code: '3130804', sem: 'SEM03' },
  {
    name: 'Object Oriented Programming using Java',
    code: '3130805',
    sem: 'SEM03',
  },

  // SEM04
  { name: 'Database Management System', code: '3140806', sem: 'SEM04' },
  {
    name: 'Computer Organization and Architecture',
    code: '3140807',
    sem: 'SEM04',
  },
  { name: 'Operating System', code: '3140808', sem: 'SEM04' },
  { name: 'Design and Analysis of Algorithms', code: '3140809', sem: 'SEM04' },

  // SEM05
  { name: 'Software Engineering', code: '3150810', sem: 'SEM05' },
  { name: 'Computer Networks', code: '3150811', sem: 'SEM05' },
  { name: 'Theory of Computation', code: '3150812', sem: 'SEM05' },
  { name: 'Web Technology', code: '3150813', sem: 'SEM05' },

  // SEM06
  { name: 'Data Mining', code: '3160814', sem: 'SEM06' },
  { name: 'Artificial Intelligence', code: '3160815', sem: 'SEM06' },
  { name: 'Cloud Computing', code: '3160816', sem: 'SEM06' },
  { name: 'Mobile Computing', code: '3160817', sem: 'SEM06' },

  // SEM07
  { name: 'Machine Learning', code: '3170818', sem: 'SEM07' },
  { name: 'Big Data Analytics', code: '3170819', sem: 'SEM07' },
  { name: 'Information Security', code: '3170820', sem: 'SEM07' },
  { name: 'Internet of Things', code: '3170821', sem: 'SEM07' },

  // SEM08
  { name: 'Project Phase I', code: '3180822', sem: 'SEM08' },
  { name: 'Project Phase II', code: '3180823', sem: 'SEM08' },
  { name: 'Cyber Security', code: '3180824', sem: 'SEM08' },
  { name: 'Blockchain Technology', code: '3180825', sem: 'SEM08' },
];
const meSubjects = [
  // SEM01 (Common Engineering)
  { name: 'Engineering Mathematics I', code: '3110001', sem: 'SEM01' },
  { name: 'Engineering Physics', code: '3110003', sem: 'SEM01' },
  { name: 'Basic Electrical Engineering', code: '3110005', sem: 'SEM01' },
  { name: 'Environmental Sciences', code: '3110007', sem: 'SEM01' },

  // SEM02 (Common Engineering)
  { name: 'Engineering Mathematics II', code: '3110014', sem: 'SEM02' },
  { name: 'Engineering Chemistry', code: '3110015', sem: 'SEM02' },
  { name: 'Basic Mechanical Engineering', code: '3110006', sem: 'SEM02' },
  { name: 'Engineering Graphics', code: '3110016', sem: 'SEM02' },

  // SEM03
  { name: 'Engineering Thermodynamics', code: '3130902', sem: 'SEM03' },
  { name: 'Strength of Materials', code: '3130903', sem: 'SEM03' },
  { name: 'Manufacturing Processes', code: '3130904', sem: 'SEM03' },
  { name: 'Engineering Mechanics', code: '3130905', sem: 'SEM03' },

  // SEM04
  { name: 'Fluid Mechanics', code: '3140906', sem: 'SEM04' },
  { name: 'Theory of Machines', code: '3140907', sem: 'SEM04' },
  { name: 'Machine Drawing', code: '3140908', sem: 'SEM04' },
  { name: 'Heat Transfer', code: '3140909', sem: 'SEM04' },

  // SEM05
  { name: 'Dynamics of Machinery', code: '3150910', sem: 'SEM05' },
  {
    name: 'Mechanical Measurements and Metrology',
    code: '3150911',
    sem: 'SEM05',
  },
  { name: 'Internal Combustion Engines', code: '3150912', sem: 'SEM05' },
  { name: 'Machine Design I', code: '3150913', sem: 'SEM05' },

  // SEM06
  { name: 'Refrigeration and Air Conditioning', code: '3160914', sem: 'SEM06' },
  { name: 'Finite Element Method', code: '3160915', sem: 'SEM06' },
  { name: 'Industrial Engineering', code: '3160916', sem: 'SEM06' },
  { name: 'Machine Design II', code: '3160917', sem: 'SEM06' },

  // SEM07
  { name: 'CAD/CAM', code: '3170918', sem: 'SEM07' },
  { name: 'Robotics', code: '3170919', sem: 'SEM07' },
  { name: 'Automobile Engineering', code: '3170920', sem: 'SEM07' },
  { name: 'Energy Engineering', code: '3170921', sem: 'SEM07' },

  // SEM08
  { name: 'Project Phase I', code: '3180922', sem: 'SEM08' },
  { name: 'Project Phase II', code: '3180923', sem: 'SEM08' },
  { name: 'Advanced Manufacturing Technology', code: '3180924', sem: 'SEM08' },
  { name: 'Renewable Energy Engineering', code: '3180925', sem: 'SEM08' },
];
const ecSubjects = [
  // SEM01 (Common Engineering)
  { name: 'Engineering Mathematics I', code: '3110001', sem: 'SEM01' },
  { name: 'Engineering Physics', code: '3110003', sem: 'SEM01' },
  { name: 'Basic Electrical Engineering', code: '3110005', sem: 'SEM01' },
  { name: 'Environmental Sciences', code: '3110007', sem: 'SEM01' },

  // SEM02 (Common Engineering)
  { name: 'Engineering Mathematics II', code: '3110014', sem: 'SEM02' },
  { name: 'Engineering Chemistry', code: '3110015', sem: 'SEM02' },
  { name: 'Basic Mechanical Engineering', code: '3110006', sem: 'SEM02' },
  { name: 'Engineering Graphics', code: '3110016', sem: 'SEM02' },

  // SEM03
  { name: 'Electronic Devices and Circuits', code: '3131102', sem: 'SEM03' },
  { name: 'Digital Electronics', code: '3131103', sem: 'SEM03' },
  { name: 'Network Theory', code: '3131104', sem: 'SEM03' },
  { name: 'Signals and Systems', code: '3131105', sem: 'SEM03' },

  // SEM04
  { name: 'Analog Communication', code: '3141106', sem: 'SEM04' },
  {
    name: 'Microprocessors and Microcontrollers',
    code: '3141107',
    sem: 'SEM04',
  },
  { name: 'Control Systems', code: '3141108', sem: 'SEM04' },
  { name: 'Electromagnetic Theory', code: '3141109', sem: 'SEM04' },

  // SEM05
  { name: 'Digital Communication', code: '3151110', sem: 'SEM05' },
  { name: 'VLSI Design', code: '3151111', sem: 'SEM05' },
  { name: 'Digital Signal Processing', code: '3151112', sem: 'SEM05' },
  { name: 'Antennas and Wave Propagation', code: '3151113', sem: 'SEM05' },

  // SEM06
  { name: 'Wireless Communication', code: '3161114', sem: 'SEM06' },
  { name: 'Embedded Systems', code: '3161115', sem: 'SEM06' },
  { name: 'Optical Communication', code: '3161116', sem: 'SEM06' },
  { name: 'Satellite Communication', code: '3161117', sem: 'SEM06' },

  // SEM07
  { name: 'Internet of Things', code: '3171118', sem: 'SEM07' },
  {
    name: 'Machine Learning for Signal Processing',
    code: '3171119',
    sem: 'SEM07',
  },
  { name: 'Advanced Communication Systems', code: '3171120', sem: 'SEM07' },
  { name: 'Radar Engineering', code: '3171121', sem: 'SEM07' },

  // SEM08
  { name: 'Project Phase I', code: '3181122', sem: 'SEM08' },
  { name: 'Project Phase II', code: '3181123', sem: 'SEM08' },
  { name: '5G Communication Systems', code: '3181124', sem: 'SEM08' },
  { name: 'Advanced Embedded Systems', code: '3181125', sem: 'SEM08' },
];
const cvSubjects = [
  // SEM01 (Common Engineering)
  { name: 'Engineering Mathematics I', code: '3110001', sem: 'SEM01' },
  { name: 'Engineering Physics', code: '3110003', sem: 'SEM01' },
  { name: 'Basic Electrical Engineering', code: '3110005', sem: 'SEM01' },
  { name: 'Environmental Sciences', code: '3110007', sem: 'SEM01' },

  // SEM02 (Common Engineering)
  { name: 'Engineering Mathematics II', code: '3110014', sem: 'SEM02' },
  { name: 'Engineering Chemistry', code: '3110015', sem: 'SEM02' },
  { name: 'Basic Mechanical Engineering', code: '3110006', sem: 'SEM02' },
  { name: 'Engineering Graphics', code: '3110016', sem: 'SEM02' },

  // SEM03
  { name: 'Engineering Mechanics', code: '3131202', sem: 'SEM03' },
  { name: 'Strength of Materials', code: '3131203', sem: 'SEM03' },
  { name: 'Surveying', code: '3131204', sem: 'SEM03' },
  {
    name: 'Building Materials and Construction',
    code: '3131205',
    sem: 'SEM03',
  },

  // SEM04
  { name: 'Structural Analysis I', code: '3141206', sem: 'SEM04' },
  { name: 'Fluid Mechanics', code: '3141207', sem: 'SEM04' },
  { name: 'Geotechnical Engineering I', code: '3141208', sem: 'SEM04' },
  { name: 'Environmental Engineering I', code: '3141209', sem: 'SEM04' },

  // SEM05
  { name: 'Structural Analysis II', code: '3151210', sem: 'SEM05' },
  { name: 'Reinforced Concrete Design', code: '3151211', sem: 'SEM05' },
  { name: 'Geotechnical Engineering II', code: '3151212', sem: 'SEM05' },
  { name: 'Transportation Engineering', code: '3151213', sem: 'SEM05' },

  // SEM06
  { name: 'Steel Structure Design', code: '3161214', sem: 'SEM06' },
  {
    name: 'Hydrology and Water Resources Engineering',
    code: '3161215',
    sem: 'SEM06',
  },
  { name: 'Environmental Engineering II', code: '3161216', sem: 'SEM06' },
  { name: 'Construction Management', code: '3161217', sem: 'SEM06' },

  // SEM07
  { name: 'Advanced Structural Design', code: '3171218', sem: 'SEM07' },
  { name: 'Bridge Engineering', code: '3171219', sem: 'SEM07' },
  { name: 'Earthquake Engineering', code: '3171220', sem: 'SEM07' },
  {
    name: 'Advanced Transportation Engineering',
    code: '3171221',
    sem: 'SEM07',
  },

  // SEM08
  { name: 'Project Phase I', code: '3181222', sem: 'SEM08' },
  { name: 'Project Phase II', code: '3181223', sem: 'SEM08' },
  { name: 'Advanced Geotechnical Engineering', code: '3181224', sem: 'SEM08' },
  { name: 'Urban Planning and Infrastructure', code: '3181225', sem: 'SEM08' },
];
const eeSubjects = [
  // SEM01 (Common Engineering)
  { name: 'Engineering Mathematics I', code: '3110001', sem: 'SEM01' },
  { name: 'Engineering Physics', code: '3110003', sem: 'SEM01' },
  { name: 'Basic Electrical Engineering', code: '3110005', sem: 'SEM01' },
  { name: 'Environmental Sciences', code: '3110007', sem: 'SEM01' },

  // SEM02 (Common Engineering)
  { name: 'Engineering Mathematics II', code: '3110014', sem: 'SEM02' },
  { name: 'Engineering Chemistry', code: '3110015', sem: 'SEM02' },
  { name: 'Basic Mechanical Engineering', code: '3110006', sem: 'SEM02' },
  { name: 'Engineering Graphics', code: '3110016', sem: 'SEM02' },

  // SEM03
  { name: 'Electrical Circuit Analysis', code: '3131302', sem: 'SEM03' },
  { name: 'Electrical Machines I', code: '3131303', sem: 'SEM03' },
  { name: 'Analog Electronics', code: '3131304', sem: 'SEM03' },
  { name: 'Electromagnetic Field Theory', code: '3131305', sem: 'SEM03' },

  // SEM04
  { name: 'Electrical Machines II', code: '3141306', sem: 'SEM04' },
  { name: 'Power Electronics', code: '3141307', sem: 'SEM04' },
  { name: 'Control Systems', code: '3141308', sem: 'SEM04' },
  { name: 'Measurement and Instrumentation', code: '3141309', sem: 'SEM04' },

  // SEM05
  { name: 'Power Systems I', code: '3151310', sem: 'SEM05' },
  {
    name: 'Microprocessors and Microcontrollers',
    code: '3151311',
    sem: 'SEM05',
  },
  { name: 'Signals and Systems', code: '3151312', sem: 'SEM05' },
  { name: 'Electrical Machine Design', code: '3151313', sem: 'SEM05' },

  // SEM06
  { name: 'Power Systems II', code: '3161314', sem: 'SEM06' },
  { name: 'Digital Signal Processing', code: '3161315', sem: 'SEM06' },
  { name: 'High Voltage Engineering', code: '3161316', sem: 'SEM06' },
  { name: 'Renewable Energy Systems', code: '3161317', sem: 'SEM06' },

  // SEM07
  { name: 'Smart Grid Technology', code: '3171318', sem: 'SEM07' },
  { name: 'Electric Drives', code: '3171319', sem: 'SEM07' },
  { name: 'Power System Protection', code: '3171320', sem: 'SEM07' },
  { name: 'Advanced Power Electronics', code: '3171321', sem: 'SEM07' },

  // SEM08
  { name: 'Project Phase I', code: '3181322', sem: 'SEM08' },
  { name: 'Project Phase II', code: '3181323', sem: 'SEM08' },
  { name: 'Electric Vehicle Technology', code: '3181324', sem: 'SEM08' },
  { name: 'Energy Management Systems', code: '3181325', sem: 'SEM08' },
];
export const SUBJECTS_BY_BRANCH = {
  CE: ceSubjects,
  IT: itSubjects,
  ME: meSubjects,
  EC: ecSubjects,
  CV: cvSubjects,
  EE: eeSubjects,
};
