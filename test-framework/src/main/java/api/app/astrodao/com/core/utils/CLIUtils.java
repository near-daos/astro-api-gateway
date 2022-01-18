package api.app.astrodao.com.core.utils;

import api.app.astrodao.com.core.exceptions.CLIExecutionNotSuccessful;
import api.app.astrodao.com.core.exceptions.FailedToExecuteCLICommand;
import api.app.astrodao.com.core.exceptions.NotEnoughBalanceExecution;
import io.qameta.allure.Allure;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@UtilityClass
public class CLIUtils {
    public synchronized static List<String> execute(String command) {
        String[] commandToExecute = {"bash", "-l", "-c", command};
        ProcessBuilder builder = new ProcessBuilder(commandToExecute);

        Allure.addAttachment("NEAR CLI Command", "text/plain", command);

        Process process;

        try {
            process = builder.start();
            process.waitFor(1, TimeUnit.MINUTES);
        } catch (IOException | InterruptedException exception) {
            log.error("Failed to execute '{}' CLI", command);
            throw new FailedToExecuteCLICommand(exception);
        }

        List<String> output = new BufferedReader(new InputStreamReader(process.getInputStream()))
                .lines().collect(Collectors.toList());

        Allure.addAttachment("NEAR CLI Response", "text/plain",
                output.stream().collect(Collectors.joining(System.lineSeparator())));

        int exitValue = process.exitValue();
        String outputText = output.stream().collect(Collectors.joining(System.lineSeparator()));
        if (exitValue != 0) {
            if (outputText.contains("not enough balance")) {
                throw new NotEnoughBalanceExecution(
                        String.format("Looks like you don't have enough balance for the account, console output:\n%s",
                                outputText)
                );
            } else {
                throw new CLIExecutionNotSuccessful(
                        String.format("Something went wrong, got '%s' exit value for the process, console output:\n%s",
                                exitValue, outputText)
                );
            }
        }

        return output;
    }
}
