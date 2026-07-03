package com.leavemanagement.security;

import com.leavemanagement.entity.Employee;
import com.leavemanagement.repository.EmployeeRepository;
import io.jsonwebtoken.Claims;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {

    private final EmployeeRepository employeeRepository;

    public CurrentUserResolver(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
            && parameter.getParameterType().equals(Employee.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer container,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory factory) {
        Authentication auth = org.springframework.security.core.context.SecurityContextHolder
            .getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof String email) {
            return employeeRepository.findByEmail(email).orElse(null);
        }
        return null;
    }
}
