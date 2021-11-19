package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.DaoApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

@Steps
@RequiredArgsConstructor
public class DaoApiSteps extends BaseSteps {
    private final DaoApi daoApi;

    @Step("Getting DAO by it's ID")
    public ResponseEntity<String> getDAOByID(String daoId) {
        return daoApi.getDaoByID(daoId);
    }
}
