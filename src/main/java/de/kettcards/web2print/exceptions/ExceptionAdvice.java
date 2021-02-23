package de.kettcards.web2print.exceptions;

//import de.kettcards.web2print.exceptions.content.ContentException;

import org.hibernate.NonUniqueResultException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

@RestControllerAdvice
public class ExceptionAdvice {

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoSuchElementException.class)
    public String handleNotFoundException(Exception exception) {
        return exception.getMessage();
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(NonUniqueResultException.class)
    public String handleAmbiguousResultException(Exception exception) {
        return "uff" + exception.getMessage();
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public String handleContentException(Exception exception) {
        exception.printStackTrace();
        return exception.getMessage();
    }

    //DataRetrievalFailureException
}
