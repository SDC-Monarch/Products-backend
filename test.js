const getRelated = (input) => {
  // Create a map to store the related items for each id
  const map = new Map();
  for (const [id, groupId, relatedId] of input) {
    // If the groupId is not in the map, add it with an empty array
    if (!map.has(groupId)) {
      map.set(groupId, []);
    }
    // Add the related id to the array for the groupId
    map.get(groupId).push(relatedId);
  }
  // Convert the map to an array of objects
  const output = Array.from(map, ([groupId, related]) => ({ id: groupId, related }));
  return output;
}

var output = getRelated([
  [ '1', '1', '2' ],
  [ '2', '1', '3' ],
  [ '3', '1', '8' ],
  [ '4', '1', '7' ],
  [ '5', '2', '3' ],
  [ '6', '2', '7' ],
  [ '7', '2', '6' ],
  [ '8', '2', '5' ],
  [ '9', '3', '5' ],
  [ '10', '3', '9' ]
])
console.log(output, new Date)