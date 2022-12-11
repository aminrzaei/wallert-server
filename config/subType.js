const allSubType = {
  basic: [],
  premium: [],
};

const subType = Object.keys(allSubType);
const subTypeRights = new Map(Object.entries(allSubType));

module.exports = {
  subType,
  subTypeRights,
};
