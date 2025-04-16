const generateId = async ({ model, prefix, fieldName }) => {
    const last = await model.findOne({ order: [[fieldName, 'DESC']] });
    
    let newId;
    let isUnique = false;
    let counter = 0;
    
    if (!last || !last[fieldName] || !new RegExp(`^${prefix}\\d+$`).test(last[fieldName])) {
      newId = `${prefix}1`;
    } else {
      const numericPart = parseInt(last[fieldName].slice(prefix.length));
      newId = `${prefix}${numericPart + 1}`;
    }
    
    while (!isUnique) {
      const existing = await model.findOne({ where: { [fieldName]: newId } });
      
      if (!existing) {
        isUnique = true;
      } else {
        counter++;
        if (!last || !last[fieldName]) {
          newId = `${prefix}${1 + counter}`;
        } else {
          const numericPart = parseInt(last[fieldName].slice(prefix.length));
          newId = `${prefix}${numericPart + 1 + counter}`;
        }
      }
    }
    
    return newId;
  };

  module.exports = generateId;