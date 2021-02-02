package de.kettcards.web2print.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import static de.kettcards.web2print.security.Authorities.CARDS_READ;
import static de.kettcards.web2print.security.Authorities.CARDS_WRITE;

/**
 * defines available access roles,
 * a set of {@link Authorities} can be assigned to each role,
 * used to prevent misconfigurations for role access permits
 */
public enum Roles {

    NONE(Collections.emptySet()),
    ADMIN(setAuthorities(CARDS_READ, CARDS_WRITE));

    private final Set<GrantedAuthority> roleAuthorities;

    Roles(Set<GrantedAuthority> roleAuthorities) {
        this.roleAuthorities = roleAuthorities;
    }

    /**
     * @return the granted authorities for each role
     */
    public Set<GrantedAuthority> getRoleAuthorities() {
        return roleAuthorities;
    }

    /**
     * utility method to define authorities for each role
     *
     * @param authorities granted authorities
     * @return an unmodifiable set of granted authorities
     */
    private static Set<GrantedAuthority> setAuthorities(Authorities... authorities) {
        return Arrays.stream(authorities).map(authority ->
                new SimpleGrantedAuthority(authority.getAuthority()))
                .collect(Collectors.toUnmodifiableSet());
    }

}
