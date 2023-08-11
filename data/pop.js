const mysql = require('mysql');
const fs = require('fs');
const colors_used = './data/The Joy Of Painiting - Colors Used';
const episode_dates = './data/The Joy Of Painiting - Subject Matter';
const subject_matter = './data/The Joy Of Painting - Episode Dates';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'joy_of_painting',
  multipleStatements: true
});

// Read colors used for episodes table
function colorsUsedforEpisodes() {
  return new Promise((resolve, reject) => {
    fs.readFile(colors_used, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading CSV file:', err);
        reject(err);
      }
      // Parse the CSV data and extract rows
      const rows = data.trim().split('\n').map(row => row.split(','));
      let episodes = [];
      for (item in rows) {
        if (item != 0) {
          episodes.push([rows[item][3], rows[item][4], rows[item][5], rows[item][2], rows[item][7]]);
        }
      }
      resolve(episodes);
    });
  });
};

function datesForEpisodes() {
  return new Promise((resolve, reject) => {
    fs.readFile(episode_dates, 'utf8', (err, data) => {

      if (err) {
        console.error('Error reading text file:', err);
        reject(err);
      }
      // Parse the text data and extract rows
      const rows = data.trim().split('\n').map(row => row.split('('));
      let item_date = "";
      dates = [];
      for (item in rows) {
        item_date = new Date(rows[item][1].split(')')[0]);
        item_date = item_date.toLocaleDateString();
        dates.push(item_date.toString());
      }
      resolve(dates);
    });
  });
}

function mergeData(data1, data2) {
  for (item in data1) {
    data1[item].push(data2[item]);
  }
  return data1;
}

// Call the functions to read and merge data from files
Promise.all([colorsUsedforEpisodes(), datesForEpisodes()])
  .then(([colors_data, dates_data]) => {
    const mergedData = mergeData(colors_data, dates_data);
    console.log(mergedData[mergedData.length - 3]);
    const sql = "INSERT INTO episodes (title, season_number, episode_number, painting_img_src, painting_yt_src, air_date) VALUES ?";

    connection.query(sql, [mergedData], (err, results, fields) => {
      if (err) {
        console.error('Error executing SQL script:', err);
        return;
      }
      console.log('SQL script executed successfully.');
    });
  })
  .catch((err) => {
    console.error('Error:', err);
  }
  );
