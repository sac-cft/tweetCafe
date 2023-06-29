import moment from 'moment';
import * as momentTimeZone from 'moment-timezone'

var latestDate= moment("2023-06-29T11:55:25.000Z");
latestDate = moment(latestDate.tz('Asia/Kolkata'));
console.log(latestDate);