export function FormatDate(date: any) {
    const year = date.getFullYear();

    // padStart는 한자리 수가 나올경우 앞을 0으로 채워주는 함수
    // 예) 1 -> 01
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}