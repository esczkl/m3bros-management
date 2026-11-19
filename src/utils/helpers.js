// Timezone-safe local date string (YYYY-MM-DD)
export const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getMonthName = (m) => {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m];
};

export const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return days;
};

// Start of month (YYYY-MM-01)
export const getStartOfMonth = () => {
    const today = new Date();
    return getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
};

// Today (YYYY-MM-DD)
export const getTodayDate = () => {
    return getLocalDateString();
};

// End of month (YYYY-MM-DD)
export const getEndOfMonth = () => {
    const today = new Date();
    return getLocalDateString(new Date(today.getFullYear(), today.getMonth() + 1, 0));
};

export const calculateCuts = (serviceType, price) => {
    if (serviceType === 'Barber') return { managementCut: price * 0.5, staffCut: price * 0.5 };
    return { managementCut: price * 0.9, staffCut: price * 0.1 };
};

export const formatCurrency = (amount) => {
    return `PHP ${amount.toFixed(2)}`;
};
