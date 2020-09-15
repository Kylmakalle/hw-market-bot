class User {
    constructor({id, first_name, last_name, username}) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.username = username;
    }

    getFullName() {
        if (this.last_name) {
            return `${this.first_name} ${this.last_name}`
        }
        
        return this.first_name;
    }

    getMentionById() {
        return `#id${this.id}`
    }

    getMentionByFullNameMarkdown() {
        return `[${this.getFullName}](tg://user?id=${this.id}) [${this.getMentionById()}]`
    }

    getMentionByFullNameHtml() {
        return `<a href="tg://user?id=${this.id}">${this.getFullName()}</a> [${this.getMentionById()}]`
    }
}

module.exports = User;