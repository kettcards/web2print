package de.kettcards.web2print.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import de.kettcards.web2print.model.Include;
import lombok.Data;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.validation.annotation.Validated;

import java.util.Properties;

@Data
@Validated
@Configuration
public class MailConfiguration {

    @JsonView(Include.Internal.class)
    private String host;

    @JsonView(Include.Internal.class)
    private Integer port;

    @JsonView(Include.Internal.class)
    private String username;

    @JsonView(Include.Internal.class)
    private String password;

    /**
     * direct configuration over properties only works with spring > 5
     * @param configuration requires the config for mail credentials
     * @return the mail sender instance
     */
    @JsonIgnore
    @Bean
    @ConditionalOnMissingBean
    public JavaMailSender getJavaMailSender(ApplicationConfiguration configuration) {
        var sender = new JavaMailSenderImpl();
        var mailConfiguration = configuration.getMail();
        sender.setHost(mailConfiguration.getHost());
        sender.setPort(mailConfiguration.getPort());
        sender.setUsername(mailConfiguration.getUsername());
        sender.setPassword(mailConfiguration.getPassword());

        Properties properties = sender.getJavaMailProperties();
        properties.put("mail.transport.protocol", "smtp");
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");

        return sender;
    }
}
