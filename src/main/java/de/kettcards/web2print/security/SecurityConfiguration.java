package de.kettcards.web2print.security;

import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.storage.WebContextAware;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

import java.util.List;

import static de.kettcards.web2print.security.Roles.ADMIN;

/**
 * Defines access control for all available endpoints
 */
@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    private final ApplicationConfiguration configuration;

    private final List<WebContextAware> webContextAwareList;

    public SecurityConfiguration(ApplicationConfiguration configuration,
                                 @Autowired(required = false) List<WebContextAware> webContextAwareList) {
        this.configuration = configuration;
        this.webContextAwareList = webContextAwareList;
    }

    /**
     * configures global security context
     *
     * @param http security context
     * @throws Exception if security context is misconfigured
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        String apiPath = configuration.getLinks().getApiPath();
        ExpressionUrlAuthorizationConfigurer<HttpSecurity>.ExpressionInterceptUrlRegistry registry = http
                //TODO enable csrf, unlikely that its necessary,
                // however we still embedding content that's pointing to external resources
                .csrf().disable()
                .cors(Customizer.withDefaults())
                .authorizeRequests()
                //specify resources that dont need authentication
                .antMatchers(HttpMethod.GET, "/define.js", "/tileview/**", "/front/**", "/fonts/**", "/textures/**").permitAll();

        if (webContextAwareList != null) { //TODO explicitly deny struct
            for (var webContextAware : webContextAwareList) {
                var rawWebPath = webContextAware.exposeTo();
                //TODO validate exposed string
                var webPath = "/" + rawWebPath + "/**";
                registry = registry.antMatchers(HttpMethod.GET, webPath).permitAll();
            }
        }

        registry.antMatchers(HttpMethod.GET, "/" + apiPath + "**").permitAll()
                .antMatchers(HttpMethod.POST, "/" + apiPath + "content/**").permitAll()
                .antMatchers(HttpMethod.POST, "/" + apiPath + "pdf/**").permitAll()
                .antMatchers(HttpMethod.POST, "/" + apiPath + "save/**").permitAll()
                .antMatchers(HttpMethod.POST, "/" + apiPath + "backend/**").permitAll()
                //explicitly define protected resources, allows refined access control
                .antMatchers("/api/**").hasRole(ADMIN.name())
                //everything else also needs authentication
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .httpBasic();
    }

    /**
     * https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#servlet-authentication-jdbc-bean
     *
     * @return the active user detail service
     */
    @Bean
    @Override
    protected UserDetailsService userDetailsService() {
        //TODO remove user when jdbc user management is implemented
        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder().encode("admin"))
                .roles(ADMIN.name()).build();
        //TODO switch to JdbcUserDetailsManager.class
        return new InMemoryUserDetailsManager(admin);
    }

    /**
     * https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#servlet-authentication-password-storage
     *
     * @return the active password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
     * https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#servlet-authentication-authenticationmanager
     * @return the active authentication manager
     * @throws Exception should never be thrown
     */
    @Bean
    protected org.springframework.security.authentication.AuthenticationManager getAuthenticationManager() throws Exception {
        return authenticationManager();
    }

}
