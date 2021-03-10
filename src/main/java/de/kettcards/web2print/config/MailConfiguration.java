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

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.util.Properties;

@Data
@Validated
@Configuration
public class MailConfiguration {

    @NotEmpty
    @JsonView(Include.Internal.class)
    private String host;

    @NotEmpty
    @JsonView(Include.Internal.class)
    private Integer port;

    @Email
    @JsonView(Include.Internal.class)
    private String username;

    @NotBlank
    @JsonView(Include.Internal.class)
    private String password;

    @JsonIgnore
    @Bean
    @ConditionalOnMissingBean
    // direct configuration over properties only works with spring > 5
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
