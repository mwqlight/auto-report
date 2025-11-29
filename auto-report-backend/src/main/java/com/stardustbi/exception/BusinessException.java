package com.stardustbi.exception;

/**
 * 业务异常类
 * 
 * @author Stardust BI Team
 * @version 1.0.0
 */
public class BusinessException extends RuntimeException {
    
    private final Integer code;
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }
    
    public Integer getCode() {
        return code;
    }
}