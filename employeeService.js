const ExcelJS = require('exceljs');
const path = require('path');

const EMPLOYEE_FILE = path.join(__dirname, 'employees.xlsx');

// Кэш для данных (чтобы не читать файл при каждом запросе)
let employeeCache = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 60 секунд

async function loadEmployees() {
  // Проверяем кэш
  const now = Date.now();
  if (employeeCache && (now - cacheTime) < CACHE_TTL) {
    return employeeCache;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EMPLOYEE_FILE);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('Лист не найден');
    }

    const employees = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Пропускаем заголовок
      
      const fullName = row.getCell(1).text?.trim();
      const position = row.getCell(2).text?.trim();
      
      if (fullName && position) {
        employees.push({ fullName, position });
      }
    });

    employeeCache = employees;
    cacheTime = now;
    return employees;
  } catch (err) {
    console.error('Ошибка загрузки Excel:', err.message);
    return [];
  }
}

async function findEmployeeByFullName(fullName) {
  if (!fullName || fullName.trim() === '') {
    return null;
  }

  const employees = await loadEmployees();
  
  // Поиск точного совпадения
  const exactMatch = employees.find(emp => 
    emp.fullName.toLowerCase() === fullName.trim().toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch;
  }

  // Поиск частичного совпадения (если точного нет)
  const partialMatch = employees.find(emp => 
    emp.fullName.toLowerCase().includes(fullName.trim().toLowerCase()) ||
    fullName.trim().toLowerCase().includes(emp.fullName.toLowerCase())
  );
  
  return partialMatch || null;
}

module.exports = { loadEmployees, findEmployeeByFullName };