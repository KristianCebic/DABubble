export class Reaction {
    constructor(
        public emoji: string = '1f680.svg',
        public userNames: string[] = ['Max Mustermann', 'Maria Musterfrau', 'Martin Muster', 'Martina Muster'],
        public userUIDs: string[] = []
    ) {}
}