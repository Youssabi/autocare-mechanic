// Comprehensive car make and model database

const carDatabase = {
    "Acura": ["ILX", "Integra", "MDX", "NSX", "RDX", "RLX", "TLX", "TSX", "ZDX"],
    "Alfa Romeo": ["4C", "Giulia", "Stelvio", "Tonale"],
    "Aston Martin": ["DB11", "DB9", "DBS", "DBX", "Rapide", "Vanquish", "Vantage"],
    "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "E-tron", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "SQ7", "SQ8", "TT"],
    "Bentley": ["Bentayga", "Continental", "Flying Spur", "Mulsanne"],
    "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "i3", "i4", "i7", "i8", "iX", "M2", "M3", "M4", "M5", "M6", "M8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4"],
    "Buick": ["Enclave", "Encore", "Encore GX", "Envision", "LaCrosse", "Regal"],
    "Cadillac": ["ATS", "CT4", "CT5", "CT6", "CTS", "Escalade", "Lyriq", "SRX", "STS", "XT4", "XT5", "XT6", "XTS"],
    "Chevrolet": ["Blazer", "Bolt EV", "Bolt EUV", "Camaro", "Colorado", "Corvette", "Cruze", "Equinox", "Express", "Impala", "Malibu", "Silverado 1500", "Silverado 2500HD", "Silverado 3500HD", "Sonic", "Spark", "Suburban", "Tahoe", "Traverse", "Trax"],
    "Chrysler": ["200", "300", "Pacifica", "Town & Country", "Voyager"],
    "Dodge": ["Challenger", "Charger", "Durango", "Grand Caravan", "Hornet", "Journey", "Ram 1500", "Ram 2500", "Ram 3500"],
    "Ferrari": ["296 GTB", "488", "812", "F8", "Portofino", "Purosangue", "Roma", "SF90"],
    "Fiat": ["124 Spider", "500", "500L", "500X"],
    "Ford": ["Bronco", "Bronco Sport", "EcoSport", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Fiesta", "Flex", "Focus", "Fusion", "Maverick", "Mustang", "Mustang Mach-E", "Ranger", "Super Duty", "Taurus", "Transit"],
    "Genesis": ["Electrified G80", "Electrified GV70", "G70", "G80", "G90", "GV60", "GV70", "GV80"],
    "GMC": ["Acadia", "Canyon", "Hummer EV", "Safari", "Savana", "Sierra 1500", "Sierra 2500HD", "Sierra 3500HD", "Terrain", "Yukon", "Yukon XL"],
    "Honda": ["Accord", "Civic", "Clarity", "CR-V", "CR-Z", "Element", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Prologue", "Ridgeline"],
    "Hyundai": ["Accent", "Azera", "Elantra", "Genesis", "Ioniq 5", "Ioniq 6", "Kona", "Nexo", "Palisade", "Santa Cruz", "Santa Fe", "Sonata", "Tucson", "Veloster", "Venue"],
    "Infiniti": ["Q50", "Q60", "Q70", "QX30", "QX50", "QX55", "QX60", "QX80"],
    "Jaguar": ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF", "XJ"],
    "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Patriot", "Renegade", "Wagoneer", "Wrangler"],
    "Kia": ["Cadenza", "Carnival", "EV6", "EV9", "Forte", "K5", "Niro", "Optima", "Rio", "Sedona", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
    "Lamborghini": ["Aventador", "Huracan", "Urus"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
    "Lexus": ["ES", "GS", "GX", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "RZ", "UX"],
    "Lincoln": ["Aviator", "Continental", "Corsair", "MKC", "MKS", "MKT", "MKX", "MKZ", "Nautilus", "Navigator"],
    "Lotus": ["Eletre", "Emira", "Evora", "Exige"],
    "Maserati": ["Ghibli", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"],
    "Mazda": ["CX-3", "CX-30", "CX-5", "CX-50", "CX-9", "CX-90", "Mazda2", "Mazda3", "Mazda6", "MX-5 Miata", "MX-30"],
    "McLaren": ["570S", "600LT", "720S", "Artura", "GT"],
    "Mercedes-Benz": ["A-Class", "AMG GT", "C-Class", "CLA", "CLS", "E-Class", "EQB", "EQE", "EQS", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "Maybach S-Class", "S-Class", "SL", "SLC", "Sprinter"],
    "Mini": ["Clubman", "Convertible", "Cooper", "Countryman", "Hardtop", "Paceman"],
    "Mitsubishi": ["Eclipse Cross", "Mirage", "Outlander", "Outlander PHEV", "Outlander Sport"],
    "Nissan": ["370Z", "Altima", "Armada", "Ariya", "Frontier", "GT-R", "Kicks", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Rogue Sport", "Sentra", "Titan", "Versa", "Z"],
    "Polestar": ["1", "2", "3"],
    "Porsche": ["718 Boxster", "718 Cayman", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
    "Ram": ["1500", "2500", "3500", "ProMaster", "ProMaster City"],
    "Rivian": ["R1S", "R1T"],
    "Rolls-Royce": ["Cullinan", "Dawn", "Ghost", "Phantom", "Wraith"],
    "Subaru": ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "Solterra", "WRX"],
    "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
    "Toyota": ["4Runner", "86", "Avalon", "bZ4X", "C-HR", "Camry", "Corolla", "Corolla Cross", "Crown", "GR86", "GR Corolla", "GR Supra", "Grand Highlander", "Highlander", "Land Cruiser", "Mirai", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza", "Yaris"],
    "Volkswagen": ["Arteon", "Atlas", "Atlas Cross Sport", "Beetle", "Golf", "Golf GTI", "ID.4", "Jetta", "Passat", "Taos", "Tiguan"],
    "Volvo": ["C40 Recharge", "S60", "S90", "V60", "V90", "XC40", "XC40 Recharge", "XC60", "XC90"]
};

// Get all makes (alphabetically sorted)
function getCarMakes() {
    return Object.keys(carDatabase).sort();
}

// Get models for a specific make
function getCarModels(make) {
    return carDatabase[make] || [];
}

// Search cars by keyword
function searchCars(keyword) {
    const results = [];
    const lowerKeyword = keyword.toLowerCase();
    
    for (const [make, models] of Object.entries(carDatabase)) {
        if (make.toLowerCase().includes(lowerKeyword)) {
            models.forEach(model => {
                results.push(`${make} ${model}`);
            });
        } else {
            models.forEach(model => {
                if (model.toLowerCase().includes(lowerKeyword)) {
                    results.push(`${make} ${model}`);
                }
            });
        }
    }
    
    return results;
}

// Get popular car combinations (for quick selection)
function getPopularCars() {
    return [
        "Toyota Camry",
        "Honda Accord",
        "Honda Civic",
        "Toyota Corolla",
        "Ford F-150",
        "Chevrolet Silverado 1500",
        "Ram 1500",
        "Honda CR-V",
        "Toyota RAV4",
        "Nissan Altima",
        "Chevrolet Equinox",
        "Toyota Highlander",
        "Jeep Grand Cherokee",
        "Ford Explorer",
        "Mazda CX-5",
        "Subaru Outback",
        "Hyundai Tucson",
        "Kia Sportage",
        "Volkswagen Tiguan",
        "BMW 3 Series"
    ];
}
