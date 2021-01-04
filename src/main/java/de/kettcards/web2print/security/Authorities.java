package de.kettcards.web2print.security;

/**
 * defines available authorities,
 * used to prevent misconfigurations for authority access permits
 */
public enum Authorities {

    CARDS_READ("CARDS_READ"),
    CARDS_WRITE("CARDS_WRITE");

    private final String authority;

    Authorities(String authority) {
        this.authority = authority;
    }

    public String getAuthority() {
        return authority;
    }

}
