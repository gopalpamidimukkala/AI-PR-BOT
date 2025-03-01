const isValidScheduleDate = (scheduledTime) => {
    const scheduleDate = new Date(scheduledTime);
    const now = new Date();
    return scheduleDate > now;
};

module.exports = { isValidScheduleDate }; 